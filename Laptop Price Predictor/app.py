# Import necessary libraries
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import pickle

app = Flask(__name__)
CORS(app)

@app.route('/get_laptops_data',methods=['GET'])
def get_data():
    df = pickle.load(open('df.pkl', 'rb'))
    return jsonify({
        'Company': df['Company'].unique().tolist(),
        'TypeName': df['TypeName'].unique().tolist(),
        'Gpu': df['Gpu'].unique().tolist(),
        'OpSys': df['OpSys'].unique().tolist(),
        'Cpu_brand': df['Cpu_brand'].unique().tolist(),
    })

@app.route('/laptop_predict', methods=['POST'])
def predict():
    if request.method == 'POST':
        data = request.json
        pipe = pickle.load(open('pipeline.pkl', 'rb'))
        
        prediction = np.exp(
            pipe.predict([
                [data['Company'], 
                data['TypeName'], 
                data['Ram'], 
                data['Gpu'], 
                data['OpSys'], 
                data['Weight'], 
                data['TouchScreen'], 
                data['IPS'], 
                data['PPI'], 
                data['Cpu'], 
                data['SSD'], 
                data['HDD']
            ]])
        )
        return jsonify(int(prediction[0]))

@app.route('/salary_predict',methods=['POST'])
def salary_predict():
    if request.method == 'POST':
        data = request.get_json()
        rg = pickle.load(open('../Salary_prediction/final_model.pkl', 'rb'))
        return jsonify(int(rg.predict([[float(data['value'])]])[0][0]))

@app.route('/get_movies')
def get_movies():
    data = request.args.get('movie')
    print(data)
    df = pickle.load(open('../Movie Recommander System/final_df.pkl', 'rb'))
    arr = list(df['original_title'].unique())
    arr = [x for x in arr if data in x.lower()]
    return jsonify(arr)
    
def predict(df, x, tfidf_matrix, tfidf_vectorizer):
    about = df[df['original_title']==x]
    about_index = about.index[0]
    new_df = df.iloc[about_index]
    user_vector = tfidf_vectorizer.transform([new_df['about']])
    
    similarities = cosine_similarity(user_vector, tfidf_matrix)
    similarities = similarities[0] * 100
    final_similars = (enumerate(similarities))
    final_similars = sorted(final_similars,reverse=True, key= lambda x : x[1])[1:6]
    
    list = []
    for tuple in final_similars:
        index = tuple[0]
        temp = df.iloc[index]
        dict = {
                'title': temp['original_title'], 
                'wiki_link':temp['wiki_link']
        }
        list.append(dict)
    return list
  
@app.route('/movie_predict', methods=['POST'])
def movie_predict():
    if request.method == 'POST':
        title  = request.args.get('movie')
        df = pickle.load(open('../Movie Recommander System/final_df.pkl', 'rb'))
        print(title)
        tfidf_vectorizer = TfidfVectorizer()
        tfidf_matrix = tfidf_vectorizer.fit_transform(df['tokens'])
        result = predict(df, title, tfidf_matrix, tfidf_vectorizer)
        return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
 