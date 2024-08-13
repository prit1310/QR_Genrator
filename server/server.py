from flask import Flask, send_file, request, jsonify, render_template,send_from_directory  # type: ignore
from flask_cors import CORS  # type: ignore
import qrcode
import io
import os

app = Flask(__name__, template_folder='templates')
CORS(app)

# connect fronted build folder
frontend_folder = os.path.join(os.getcwd(),"..","client")
dist_folder = os.path.join(frontend_folder,"dist")

# server dist routes
@app.route("/",defaults={"filename":""})
@app.route("/<path:filename>")
def index(filename):
    if not filename:
        filename = "index.html"
    return send_from_directory(dist_folder,filename)

@app.route("/qrcode")
def generate_qr():
    total_amount = request.args.get('totalAmount', default='0', type=str)
    url = f"http://127.0.0.1:5000/qr-info?totalAmount={total_amount}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    img_io = io.BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)

    return send_file(img_io, mimetype='image/png')

@app.route("/qr-info")
def qr_info():
    total_amount = request.args.get('totalAmount', default='0', type=str)
    return render_template("payment_options.html", total_amount=total_amount)

if __name__ == "__main__":
    app.run(debug=True)
