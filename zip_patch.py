import sys

filepath = "/opt/reddit-analyzer/api_server_simple.py"
with open(filepath, "r") as f:
    content = f.read()

if "import zipfile" not in content:
    content = content.replace(
        "from flask import Flask, request, jsonify",
        "from flask import Flask, request, jsonify, send_file"
    )
    content = content.replace(
        "import threading",
        "import threading\nimport zipfile\nimport io"
    )

zip_code = """
@app.route("/admin/download-all-zip", methods=["GET"])
@check_admin_auth
def download_all_zip():
    if not os.path.exists(CACHE_DIR):
        return jsonify({"error": "No cache directory found"}), 404
    json_files = [f for f in os.listdir(CACHE_DIR) if f.endswith(".json")]
    if not json_files:
        return jsonify({"error": "No cached users found"}), 404
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for fn in sorted(json_files):
            fpath = os.path.join(CACHE_DIR, fn)
            try:
                zf.write(fpath, arcname=fn)
            except Exception as e:
                print(f"Skipping {fn}: {e}", file=sys.stderr)
    buf.seek(0)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    return send_file(buf, mimetype="application/zip", as_attachment=True, download_name=f"reddit_users_{ts}.zip")

"""

if "/admin/download-all-zip" not in content:
    anchor = '@app.route("/admin/cached-users", methods=["GET"])'
    content = content.replace(anchor, zip_code + anchor)

with open(filepath, "w") as f:
    f.write(content)

print("PATCH OK")
