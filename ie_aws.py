from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS # type: ignore 

app = Flask(__name__)
CORS(app)  # open CORS support

# 配置数据库连接(confige database connection)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://admin:password@iedata.cry0g6ckyhnu.ap-southeast-2.rds.amazonaws.com:3306/IE'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 初始化数据库(initial database)
db = SQLAlchemy(app)

# 定义模型（ set a database model) （TEST)
class Facility(db.Model):
    __tablename__ = 'facilities'
    FacilityName = db.Column(db.String(255), primary_key=True)
    Latitude = db.Column(db.Numeric(10, 7))
    Longitude = db.Column(db.Numeric(10, 7))
    SportsPlayed = db.Column(db.String(255))
    Category = db.Column(db.String(255))

@app.route('/facilities', methods=['GET'])
def get_facilities():
    facilities = Facility.query.all()
    results = [
        {
            "FacilityName": facility.FacilityName,
            "Latitude": str(facility.Latitude),
            "Longitude": str(facility.Longitude),
            "SportsPlayed": facility.SportsPlayed,
            "Category": facility.Category
        } for facility in facilities]

    return jsonify(results)

@app.route('/db', methods=['GET'])
def db_home():
    return jsonify(message="Hello, Flask with AWS RDS!")

@app.route('/get', methods=['GET'])
def get_data():
    data = {'message': 'Hello from Flaskkk-kkkkbbkk-dkk goollld!'}
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




