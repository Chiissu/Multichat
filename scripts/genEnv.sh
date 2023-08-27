#! /bin/bash

env_file=".env"
default_dotenv="scripts/defaultDotenv"

if [ ! -e "$env_file" ]; then
    cp "$default_dotenv" "$env_file"
    echo "Created $env_file by duplicating $default_dotenv."
else
    read -p "$env_file already exists. Do you want to replace it? (y/n): " choice
    case "$choice" in
        y|Y)
            cp "$default_dotenv" "$env_file"
            echo "Replaced $env_file with $default_dotenv."
            ;;
        n|N)
            echo "No changes made."
            ;;
        *)
            echo "Invalid choice. No changes made."
            ;;
    esac
fi

