import { openai } from "@/lib/openai";
import fs from "node:fs/promises";
import path from "node:path";

interface MMIQuestion {
  id: string;
  question: string;
  provinceCode: string;
  provinceName: string;
}

interface ProvinceQuestions {
  provinceCode: string;
  provinceName: string;
  numSchools: number;
  questions: MMIQuestion[];
}

const CANADIAN_PROVINCES: { [key: string]: number } = {
  AB: 2, // Alberta (Calgary, Alberta)
  BC: 1, // British Columbia (UBC)
  MB: 1, // Manitoba
  NL: 1, // Newfoundland
  NS: 1, // Nova Scotia
  ON: 6, // Ontario
  QC: 4, // Quebec
  SK: 1, // Saskatchewan
};

const PROVINCE_NAMES: { [key: string]: string } = {
  AB: "Alberta",
  BC: "British Columbia",
  MB: "Manitoba",
  NB: "New Brunswick",
  NL: "Newfoundland and Labrador",
  NS: "Nova Scotia",
  ON: "Ontario",
  PE: "Prince Edward Island",
  QC: "Quebec",
  SK: "Saskatchewan",
};

function parseGPTResponse(content: string): string[] {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.questions)) return parsed.questions;
    if (typeof parsed === "object") {
      const values = Object.values(parsed);
      if (values.some(Array.isArray)) {
        return values.find(Array.isArray) || [];
      }
    }

    return content
      .split("\n")
      .map((line) => line.trim())
      .filter(
        (line) =>
          line.length > 0 &&
          !line.startsWith("{") &&
          !line.startsWith("}") &&
          !line.startsWith("[") &&
          !line.startsWith("]")
      )
      .map((line) => line.replace(/^["'\d.]+[-.)]\s*/, "").replace(/[",]+$/, ""));
  } catch (error) {
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => line.replace(/^["'\d.]+[-.)]\s*/, "").replace(/[",]+$/, ""));
  }
}

async function generateMMIQuestionsForProvince(provinceCode: string): Promise<MMIQuestion[]> {
  const provinceName = PROVINCE_NAMES[provinceCode];
  const prompt = `Generate 30 Multiple Mini Interview (MMI) questions for ${provinceName} medical school applicants.
Each question should deeply relate to healthcare scenarios, ethical dilemmas, and cultural considerations unique to ${provinceName}, Canada.
Consider:
- Canadian healthcare system (universal healthcare)
- Provincial health policies and challenges
- Indigenous health and reconciliation
- Rural vs urban healthcare access
- Cultural diversity and immigration in the province
- Current healthcare issues specific to ${provinceName}
Format each question as a complete sentence on a new line.`;

  try {
    const response = await openai.chat.completions.create({
      model: "o1-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0].message.content || "";
    const questions = parseGPTResponse(content);

    const validQuestions = questions.filter((q) => q.length > 20).slice(0, 30);

    return validQuestions.map((question, index) => ({
      id: `${provinceCode}-${index + 1}`,
      question: question.trim(),
      provinceCode,
      provinceName: PROVINCE_NAMES[provinceCode],
    }));
  } catch (error) {
    console.error(`Error generating questions for ${PROVINCE_NAMES[provinceCode]}:`, error);
    return [];
  }
}

async function saveToJSON(data: ProvinceQuestions[]) {
  const outputDir = path.join(__dirname, "mmi_questions");
  await fs.mkdir(outputDir, { recursive: true });

  // Save all questions in one file
  const allQuestionsPath = path.join(outputDir, "all_canadian_questions.json");
  await fs.writeFile(allQuestionsPath, JSON.stringify(data, null, 2));

  // Save individual province files
  for (const provinceData of data) {
    const provinceFilePath = path.join(
      outputDir,
      `${provinceData.provinceCode.toLowerCase()}_questions.json`
    );
    await fs.writeFile(provinceFilePath, JSON.stringify(provinceData, null, 2));
  }
}

async function generateAllProvinceQuestions() {
  const allProvinceQuestions: ProvinceQuestions[] = [];
  const provinceEntries = Object.entries(CANADIAN_PROVINCES);

  // Process provinces in chunks of 3
  for (let i = 0; i < provinceEntries.length; i += 3) {
    const chunk = provinceEntries.slice(i, i + 3);
    console.log(`Processing provinces: ${chunk.map(([code]) => code).join(", ")}...`);

    const chunkResults = await Promise.all(
      chunk.map(async ([provinceCode, numSchools]) => {
        try {
          const questions = await generateMMIQuestionsForProvince(provinceCode);
          return {
            provinceCode,
            provinceName: PROVINCE_NAMES[provinceCode],
            numSchools,
            questions,
          };
        } catch (error) {
          console.error(`Failed to generate questions for ${provinceCode}:`, error);
          return null;
        }
      })
    );

    const validResults = chunkResults.filter(
      (result): result is ProvinceQuestions => result !== null
    );
    allProvinceQuestions.push(...validResults);

    await saveToJSON(allProvinceQuestions);

    if (i + 3 < provinceEntries.length) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  return allProvinceQuestions;
}

async function testGenerateOneProvince(provinceCode: string) {
  console.log(
    `Testing question generation for ${PROVINCE_NAMES[provinceCode]} (${provinceCode})...`
  );

  const questions = await generateMMIQuestionsForProvince(provinceCode);
  const provinceData: ProvinceQuestions = {
    provinceCode,
    provinceName: PROVINCE_NAMES[provinceCode],
    numSchools: CANADIAN_PROVINCES[provinceCode],
    questions,
  };

  await saveToJSON([provinceData]);

  console.log(`Generated ${questions.length} questions for ${PROVINCE_NAMES[provinceCode]}`);
  return provinceData;
}

// Uncomment one of these to run:
// testGenerateOneProvince("ON");
generateAllProvinceQuestions()
  .then(() => console.log("Successfully generated all Canadian MMI questions"))
  .catch(console.error);
