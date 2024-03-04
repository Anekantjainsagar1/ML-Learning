import json

def extract_code_cells(ipynb_file):
    with open(ipynb_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    code_cells = [cell['source'] for cell in data['cells'] if cell['cell_type'] == 'code']
    return code_cells

def write_to_py(code_cells, output_file):
    with open(output_file, 'w') as f:
        for cell in code_cells:
            for line in cell:
                f.write(line)
            f.write('\n\n')

if __name__ == "__main__":
    ipynb_file = "../Movie Recommander System/index.ipynb"
    output_file = "../Movie Recommander System/output.py"

    code_cells = extract_code_cells(ipynb_file)
    write_to_py(code_cells, output_file)

    print(f"Python code has been written to {output_file}.")
