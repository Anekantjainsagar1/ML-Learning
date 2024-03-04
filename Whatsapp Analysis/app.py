import pandas as pd
from flask import Flask, jsonify,request
from flask_cors import CORS
import matplotlib.pyplot as plt
import seaborn as sns
import re
import nltk
nltk.download('punkt')
from urlextract import URLExtract
from nltk.corpus import stopwords
import string
from collections import Counter

extractor = URLExtract()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def remove_stopwords(arr):
    list = []
    for i in arr:
        if i not in stopwords.words('english') and i not in string.punctuation:
            list.append(i)
    return list

# Sample route
@app.route('/post', methods=['POST'])
def index():
    if request.method == 'POST':
        if 'file' not in request.files:
            return 'No file part'
        file = request.files['file']

        f = open('WhatsApp Chat with Mr. Sarthak Gour Sir.txt', 'r', encoding='utf-8')
        df = f.read()
        msgs = re.split('\d{2}\/\d{2}\/\d{2},\s\d{1,2}:\d{2}\s(?:am|pm)\s-\s', df)[1:]
        dates = re.findall('\d{2}\/\d{2}\/\d{2},\s\d{1,2}:\d{2}\s(?:am|pm)\s-\s', df)
        df = pd.DataFrame({'messages': msgs, 'date': dates})
        df['date'] = pd.to_datetime(df['date'], format='%d/%m/%y, %I:%M %p - ')
        messages = []
        users = []

        def categories(str):
            pattern = '([\w\W]+?):\s'
            data = re.split(pattern, str)
            if len(data)>1:
                messages.append(data[2])
                users.append(data[1])
            else:
                users.append("Group Notification")
                messages.append(data[0])
        df['messages'].apply(categories)
        df['user'] = users
        df['messages'] = messages
        top_5_users = df['user'].value_counts().head(5).to_dict()
        
        df['year'] = df['date'].dt.year
        df['month_name'] = df['date'].dt.month_name()
        df['month'] = df['date'].dt.month
        df['day_name'] = df['date'].dt.day_name()
        df['day'] = df['date'].dt.day
        df['hour'] = df['date'].dt.hour
        df['minute'] = df['date'].dt.minute
        final_df = df
        
        df['messages'] = df['messages'].apply(lambda x : x.lower())
        df['words'] = df['messages'].apply(lambda str : nltk.word_tokenize(str))
        df['words_count'] = df['words'].apply(lambda str : len(str))
        df['media'] = df['messages'].apply(lambda x : x.find('<media')) != -1
        media_count = df[df['media']==True].shape[0]
        
        def find_link(str):
            links = []
            links.extend(extractor.find_urls(str))
            return links

        df['links'] = df['messages'].apply(find_link)
        df['tokens'] = df['words'].apply(remove_stopwords)
        links = final_df['links'].to_dict()
        
        list = []
        def temp(arr, user, links, media):
            if user != 'Group Notification' and media == False and len(links)==0:
                for i in arr:
                    list.append(i)

        df.apply(lambda df : temp(df['tokens'], df['user'], df['links'], df['media']), 1)
        top_msg_df = pd.DataFrame(Counter(list).most_common(50)).to_dict()
        
        emojis = []
        def is_emoji(character):
            # Emojis typically fall within this Unicode range
            return 0x1F600 <= ord(character) <= 0x1F64F or \
                0x1F300 <= ord(character) <= 0x1F5FF or \
                0x1F680 <= ord(character) <= 0x1F6FF or \
                0x1F700 <= ord(character) <= 0x1F77F or \
                0x1F780 <= ord(character) <= 0x1F7FF or \
                0x1F800 <= ord(character) <= 0x1F8FF or \
                0x1F900 <= ord(character) <= 0x1F9FF or \
                0x1FA00 <= ord(character) <= 0x1FA6F or \
                0x1FA70 <= ord(character) <= 0x1FAFF or \
                0x2600 <= ord(character) <= 0x26FF or \
                0x2700 <= ord(character) <= 0x27BF or \
                0xFE00 <= ord(character) <= 0xFE0F or \
                0x1F900 <= ord(character) <= 0x1F9FF or \
                0x1F9E0 <= ord(character) <= 0x1F9FF or \
                0x200D <= ord(character) <= 0x200D or \
                0x20E3 <= ord(character) <= 0x20E3
        for msg in df['messages']:
            emojis.extend(word for word in msg if any(is_emoji(c) for c in word))
            
        top_emojis = pd.DataFrame(Counter(emojis).most_common(50)).to_dict()
        
        timeline = df.groupby(['year','month','month_name']).count()['messages'].reset_index()
        time = []
        for i in range(timeline.shape[0]):
            time.append(timeline['month_name'][i] + "-" + str(timeline['year'][i]))
        timeline['time'] = time
        
        df['only_date'] = df['date'].dt.date
        daily_timeline = df.groupby('only_date').count()['messages'].reset_index()
                
        return jsonify(
            {
                'top_5_users':top_5_users,
                'top_msg_df': top_msg_df,
                'top_emojis' : top_emojis,
                'messages': str(final_df['messages'].shape[0]),
                'total_words': str(final_df['words_count'].sum()),
                'total_links': links,
                'media_count': str(media_count),
                'monthly_timeline_time': time,
                'monthly_timeline_value': timeline['messages'].values.tolist(),
                'daily_timeline_time': daily_timeline['only_date'].values.tolist(),
                'daily_timeline_value': daily_timeline['messages'].values.tolist()
            }
        )

if __name__ == '__main__':
    app.run(debug=True)