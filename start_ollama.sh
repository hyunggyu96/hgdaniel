export OLLAMA_HOST=0.0.0.0
ollama serve &
sleep 5
ollama run llama3.2:3b
