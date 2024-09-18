from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS # type: ignore 

app = Flask(__name__)
CORS(app)  # open CORS support

# 配置数据库连接(confige database connection)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://admin:password@database-2.cry0g6ckyhnu.ap-southeast-2.rds.amazonaws.com:3306/IE'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False 

# 初始化数据库(initial database)
db = SQLAlchemy(app)

# 定义 Maps 模型 (set a database model for the Maps table)
class Map(db.Model):
    __tablename__ = 'Maps'
    FacilityName = db.Column(db.Text, primary_key=True)
    Latitude = db.Column(db.Float)
    Longitude = db.Column(db.Float)
    Classification = db.Column(db.Text)
    Category = db.Column(db.Text)

@app.route('/maps', methods=['GET'])
def get_maps():
    maps = Map.query.all()
    results = [
        {
            "FacilityName": map_item.FacilityName,
            "Latitude": str(map_item.Latitude),
            "Longitude": str(map_item.Longitude),
            "Classification": map_item.Classification,
            "Category": map_item.Category
        } for map_item in maps]

    return jsonify(results)

@app.route('/db', methods=['GET'])
def db_home():
    return jsonify(message="Hello, Flask with AWS RDS!")

@app.route('/get', methods=['GET'])
def get_data():
    data = {'message': 'Hello from Flaskkk-!'}
    return jsonify(data)

@app.route('/post', methods=['POST'])
def post_data():
    json_data = request.json
    response = {'received': json_data}
    return jsonify(response)

@app.route('/', methods=['GET'])
def home():
    data = {'message': 'OK!'}
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)






