from flask import Blueprint, render_template, url_for
from flask import current_app
from os import path
import requests

main = Blueprint('main', __name__)
ollama_url = "http://localhost:11434"

@main.route('/')
def index():
    # response = requests.get(f"{ollama_url}/api/completions")
    return render_template('index.html')