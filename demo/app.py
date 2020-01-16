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
    return render_template("index.html")

@app.route('/get_data', methods=['GET', 'POST'])
def get_data():
    if request.method == "POST":
        input_text = request.get_data()
        json_re = json.loads(input_text)
        data = word2story(json_re) 
        #import pickle  # data = word2story(input_text)
        #pkl_file = open('/home/vindzilla/GPT/data.pkl', 'rb')
        #data = pickle.load(pkl_file)
        #pkl_file.close()
        return data
    else:
        return {}

if __name__ == '__main__':
    app.run(port=80,host="0.0.0.0")

