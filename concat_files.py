import os
from typing import List


def concat_files_to_txt(
    root_dir: str,
    output_file: str,
    exclude_dirs: List[str] = None,
    exclude_files: List[str] = None,
) -> None:
    """
    Concatenates all files in the specified directory into a single text file,
    excluding specified directories and files.

    Args:
        root_dir (str): The root directory to traverse.
        output_file (str): The path to the output text file.
        exclude_dirs (List[str], optional): List of directory names to exclude.
                                           Defaults to ['node_modules', '.next'].
        exclude_files (List[str], optional): List of file names to exclude.
                                            Defaults to ['.env', 'pnpm-lock.yaml'].
    """
    if exclude_dirs is None:
        exclude_dirs = ["node_modules", ".next"]
    if exclude_files is None:
        exclude_files = [".env", "pnpm-lock.yaml"]

    with open(output_file, "w", encoding="utf-8") as outfile:
        for dirpath, dirnames, filenames in os.walk(root_dir):
            # Modify dirnames in-place to skip excluded directories
            dirnames[:] = [
                d for d in dirnames if d not in exclude_dirs and not d.startswith(".")
            ]

            for filename in filenames:
                file_path = os.path.join(dirpath, filename)

                # Skip excluded files and hidden files
                if filename in exclude_files or filename.startswith("."):
                    continue

                try:
                    with open(file_path, "r", encoding="utf-8") as infile:
                        outfile.write(f"\n=== {file_path} ===\n")
                        outfile.write(infile.read())
                        outfile.write("\n")
                except (UnicodeDecodeError, PermissionError):
                    # Skip files that can't be read as text
                    continue


def main():
    root_directory = "."  # Replace with your project directory if different
    output_path = "combined_files.txt"
    excluded_directories = ["node_modules", ".next"]
    excluded_files = [".env", "pnpm-lock.yaml"]

    concat_files_to_txt(
        root_dir=root_directory,
        output_file=output_path,
        exclude_dirs=excluded_directories,
        exclude_files=excluded_files,
    )
    print(f"All files have been concatenated into {output_path}")


if __name__ == "__main__":
    main()
