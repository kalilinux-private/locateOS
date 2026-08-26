from flask import Flask,render_template

app=Flask(__name__)
@app.route('/')
def index():
    baidu_ak="Jbh3Qsv1p6q20YUxCxmY9TJqgeV9nMiJ"
    return render_template("locate.html",ak=baidu_ak)
    
if __name__=='__main__':
    app.run(host="0.0.0.0",port=9999,debug=True)
    
