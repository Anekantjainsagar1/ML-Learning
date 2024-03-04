import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
nltk.download('stopwords')
nltk.download('punkt')

df = pd.read_csv("bollywood_full.csv")
df.drop(['title_x', 'poster_path', 'title_y', 'runtime', 'imdb_rating', 'imdb_votes', 'tagline', 'wins_nominations', 'release_date'], axis=1, inplace=True)

df['story'] = df['story'].fillna('')
df['actors'] = df['actors'].fillna('')
df['genres'] = df['genres'].apply(lambda x : ' '.join(x.split('|')))
df['genres'] = df['genres'].apply(lambda x: x.lower())
df['story'] = df['story'].apply(lambda x:x.lower())
df['summary'] = df['summary'].apply(lambda x:x.lower())

def actors(x):
    arr = x.split('|')
    list = []
    for i in arr:
        list.append(i.lower().replace(' ',''))
    return ' '.join(list)
df['actors'] = df['actors'].apply(actors)

df['about'] = df['genres'] + ' ' + df['story'] + ' ' + df['summary'] + ' ' + df['actors']
df.drop(['genres','summary','story','actors','year_of_release','is_adult'], axis =1, inplace=True)

def tokenizer(str):
  tokens = word_tokenize(str)
  tokens = [word.lower() for word in tokens if word.isalpha() and word.lower() not in stopwords.words('english')]
  preprocessed_text = ' '.join(tokens)
  return preprocessed_text

df['tokens'] = df['about'].apply(tokenizer)

tfidf_vectorizer = TfidfVectorizer()
tfidf_matrix = tfidf_vectorizer.fit_transform(df['tokens'])

def predict(x):
    about = df[df['original_title']==x]
    about_index = about.index[0]
    new_df = df.iloc[about_index]
    
    user_vector = tfidf_vectorizer.transform([new_df['about']])
    similarities = cosine_similarity(user_vector, tfidf_matrix)
    similarities = similarities[0] * 100
    final_similars = list(enumerate(similarities))
    final_similars = sorted(final_similars,reverse=True, key= lambda x : x[1])[1:6]
    return final_similars

result = predict('Uri: The Surgical Strike')

def get_recommand(result):
    list = []
    for tuple in result:
        index = tuple[0]
        temp = df.iloc[index]
        dict = {
                'title': temp['original_title'], 
                'wiki_link':temp['wiki_link']
        }
        list.append(dict)
    return list

print(get_recommand(result))