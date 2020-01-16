from flask import Flask
from flask import render_template
from flask import request

import sys
sys.path.append("../GPT/")
from show import word2story


# app = Flask(__name__)
app = Flask(__name__, static_folder='', static_url_path='')


@app.route('/', methods=['GET', 'POST'])
def demo_show():
    # data = {'text1': "1", 'text2': '2', 'text3': '3', 'text4': '4', 'text5': '5', 'text6': '6',
    #         'path1': 'templates/image/a1.png '}
    return render_template("index.html")

@app.route('/get_data', methods=['GET', 'POST'])
def get_data():
    if request.method == "POST": 
        input_text = request.form['text']
        data = word2story(input_text)
        #import pickle# data = word2story(input_text)
        #pkl_file = open('/home/vindzilla/GPT/data.pkl', 'rb')
        #data = pickle.load(pkl_file)
        #pkl_file.close()
        #data = {'dataArr': [{'text': "This is image 1111.", 'image': 'template/S28E20_743.jpg'}]}
        return data
    else:
        return {}

if __name__ == '__main__':
    app.run(port=80,host="0.0.0.0")

