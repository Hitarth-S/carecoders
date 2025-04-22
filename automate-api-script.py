#!/usr/bin/env python3
"""
Automate API URL Updates

This script automatically updates the ngrok URL across all relevant files in the project.
It handles the API URL in brain.html, lung.html, retina.html, script.js, and api-config.js.
"""

import os
import re
import argparse
import json
from pathlib import Path


def get_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Update ngrok URL in project files')
    parser.add_argument('--url', required=True, help='New ngrok URL (e.g., https://abc-123-456-789.ngrok-free.app)')
    parser.add_argument('--directory', default='.', help='Project directory path (defaults to current directory)')
    parser.add_argument('--config', default='url_config.json', help='Config file to save the current URL')
    return parser.parse_args()


def update_file(filepath, old_url, new_url):
    """Update a single file by replacing old URL with new URL."""
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Count occurrences for reporting
        occurrences = content.count(old_url)
        
        # Replace the URL
        updated_content = content.replace(old_url, new_url)
        
        # Write back only if changes were made
        if content != updated_content:
            with open(filepath, 'w', encoding='utf-8') as file:
                file.write(updated_content)
            return occurrences
        return 0
    except Exception as e:
        print(f"Error updating {filepath}: {e}")
        return 0


def find_current_url(config_path, file_paths):
    """
    Find the current URL either from config file or by scanning project files.
    """
    # Try to get URL from config first
    if os.path.exists(config_path):
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
                return config.get('current_url')
        except Exception as e:
            print(f"Could not read config file: {e}")
    
    # If no config or config doesn't have URL, try to extract from api-config.js
    api_config = next((p for p in file_paths if p.name == 'api-config.js'), None)
    if api_config and api_config.exists():
        try:
            with open(api_config, 'r') as f:
                content = f.read()
                # Look for URL pattern in the JS file
                url_match = re.search(r'https://[a-zA-Z0-9-]+\.ngrok-free\.app', content)
                if url_match:
                    return url_match.group(0)
        except Exception as e:
            print(f"Error extracting URL from api-config.js: {e}")
    
    # If still no URL found, scan all HTML files
    for file_path in file_paths:
        if file_path.suffix == '.html' and file_path.exists():
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                    url_match = re.search(r'https://[a-zA-Z0-9-]+\.ngrok-free\.app', content)
                    if url_match:
                        return url_match.group(0)
            except Exception as e:
                print(f"Error scanning {file_path}: {e}")
    
    return None


def save_config(config_path, url):
    """Save the current URL to config file."""
    try:
        with open(config_path, 'w') as f:
            json.dump({'current_url': url}, f)
    except Exception as e:
        print(f"Could not save config file: {e}")


def main():
    """Main function to update URLs across files."""
    args = get_args()
    new_url = args.url.rstrip('/')  # Remove trailing slash if present
    project_dir = Path(args.directory)
    config_path = project_dir / args.config
    
    # Validate the new URL format
    if not re.match(r'^https://[a-zA-Z0-9-]+\.ngrok-free\.app$', new_url):
        print(f"Warning: URL format '{new_url}' doesn't match expected ngrok format.")
        proceed = input("Continue anyway? (y/n): ")
        if proceed.lower() != 'y':
            return
    
    # Define files to check
    files_to_check = [
        project_dir / 'api-config.js',
        project_dir / 'script.js',
        project_dir / 'brain.html',
        project_dir / 'lung.html',
        project_dir / 'retina.html'
    ]
    
    # Find current URL
    old_url = find_current_url(config_path, files_to_check)
    if not old_url:
        print("Could not find current ngrok URL in any file.")
        proceed = input("Do you want to search for a custom URL pattern? (y/n): ")
        if proceed.lower() == 'y':
            pattern = input("Enter URL pattern to search for: ")
            old_url = pattern
        else:
            print("Exiting.")
            return
    
    print(f"Found current URL: {old_url}")
    print(f"Will update to new URL: {new_url}")
    
    # Update each file
    total_replacements = 0
    files_updated = 0
    
    for file_path in files_to_check:
        if file_path.exists():
            replacements = update_file(file_path, old_url, new_url)
            if replacements > 0:
                print(f"Updated {replacements} occurrences in {file_path.name}")
                total_replacements += replacements
                files_updated += 1
        else:
            print(f"Warning: {file_path.name} not found.")
    
    # Save the new URL to config
    save_config(config_path, new_url)
    
    # Summary
    print(f"\nSummary:")
    print(f"- Total files updated: {files_updated}")
    print(f"- Total URL replacements: {total_replacements}")
    print(f"- New URL saved to config file: {config_path}")


if __name__ == "__main__":
    main()
