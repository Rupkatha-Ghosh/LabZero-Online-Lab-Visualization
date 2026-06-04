import os
import re
import json

BASE_DIR = r"C:\Projects\LabZero-Online-Lab-Visualization"
CONSTANTS_PATH = os.path.join(BASE_DIR, "Frontend", "src", "utils", "constants.ts")
JSON_PATH = os.path.join(BASE_DIR, "Frontend", "src", "services", "translations.json")

def main():
    if not os.path.exists(CONSTANTS_PATH):
        print(f"Error: constants.ts not found at {CONSTANTS_PATH}")
        return
    if not os.path.exists(JSON_PATH):
        print(f"Error: translations.json not found at {JSON_PATH}")
        return

    with open(CONSTANTS_PATH, "r", encoding="utf-8") as f:
        constants_content = f.read()

    with open(JSON_PATH, "r", encoding="utf-8") as f:
        translations = json.load(f)

    # Robust regex from sync_theories.py to extract slug and theory
    matches = re.findall(r"slug:\s*['\"]([^'\"]+)['\"](?:(?!slug:)[\s\S])*?theory:\s*`([\s\S]*?)`", constants_content)
    print(f"Found {len(matches)} theories in constants.ts.")

    modified = False

    for slug, theory in matches:
        new_key = theory.strip().replace("\r", "")
        slug = slug.strip()

        # Check if new_key is already in translations.json
        if new_key in translations:
            print(f"Slug '{slug}': New theory key is already in translations.json.")
            continue

        # Look for the old key that starts with the same header
        prefix = new_key[:80]
        found_old_key = None
        for key in list(translations.keys()):
            normalized_key = key.replace("\r", "")
            if len(normalized_key) > 100 and normalized_key.startswith(prefix[:40]):
                found_old_key = key
                break

        if found_old_key:
            print(f"Slug '{slug}': Replacing old translation key with the new theory key.")
            # Copy old translations as a base
            old_val = translations[found_old_key]
            
            # Since we've changed the text (appended WIM), let's clear the bn/hi values
            # so that translate.py will re-translate the entire new text cleanly
            translations[new_key] = {
                "en": new_key,
                "bn": "",
                "hi": ""
            }
            # Remove the old key
            del translations[found_old_key]
            modified = True
        else:
            print(f"Slug '{slug}': Adding new translation key to translations.json.")
            translations[new_key] = {
                "en": new_key,
                "bn": "",
                "hi": ""
            }
            modified = True

    if modified:
        with open(JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(translations, f, indent=2, ensure_ascii=False)
        print("Successfully updated translations.json.")
    else:
        print("No changes made to translations.json.")

if __name__ == "__main__":
    main()
