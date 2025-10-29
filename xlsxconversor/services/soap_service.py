import os, tempfile, requests
from cryptography.hazmat.primitives.serialization import pkcs12, Encoding, PrivateFormat, NoEncryption
from dotenv import load_dotenv
import os

load_dotenv()

def _pfx_to_temp_pem(pfx_path, pfx_password):
    with open(pfx_path,'rb') as f:
        pfx_data = f.read()
    private_key, cert, additional = pkcs12.load_key_and_certificates(pfx_data, pfx_password.encode() if pfx_password else None)
    if private_key is None or cert is None:
        raise ValueError('invalid pfx')
    tmp_cert = tempfile.NamedTemporaryFile(delete=False, suffix='.pem')
    tmp_key = tempfile.NamedTemporaryFile(delete=False, suffix='.pem')
    tmp_cert.write(cert.public_bytes(Encoding.PEM)); tmp_cert.flush()
    tmp_key.write(private_key.private_bytes(Encoding.PEM, PrivateFormat.TraditionalOpenSSL, NoEncryption())); tmp_key.flush()
    return tmp_cert.name, tmp_key.name
WS_SEND_URL = os.environ.get('WS_SEND_URL','https://homologacao.sefaz.es.gov.br/PetroleoGasWS/EnvioDocumento.asmx')
WS_CONSULT_URL = os.environ.get('WS_CONSULT_URL','https://homologacao.sefaz.es.gov.br/PetroleoGasWS/EnvioDocumento.asmx')
def send_bmp_xml(signed_xml_bytes):
    xml_str = signed_xml_bytes.decode('utf-8')
    envelope = f"""<?xml version='1.0' encoding='utf-8'?><soap12:Envelope xmlns:soap12='http://www.w3.org/2003/05/soap-envelope'><soap12:Body><EnviarBmpCampo xmlns='http://tempuri.org/'><xml>{xml_str}</xml></EnviarBmpCampo></soap12:Body></soap12:Envelope>"""
    cert_pem, key_pem = _pfx_to_temp_pem(os.environ.get("PFX_PATH"), os.environ.get("PFX_PASS"))
    try:
        resp = requests.post(WS_SEND_URL, data=envelope.encode('utf-8'), headers={'Content-Type':'application/soap+xml; charset=utf-8'}, cert=(cert_pem,key_pem), verify=True, timeout=60)
        return resp
    finally:
        try:
            os.unlink(cert_pem); os.unlink(key_pem)
        except Exception:
            pass
def consult_protocol_ws(protocol_number):
    envelope = f"""<?xml version='1.0' encoding='utf-8'?><soap12:Envelope xmlns:soap12='http://www.w3.org/2003/05/soap-envelope'><soap12:Body><ConsultarProtocolo xmlns='http://tempuri.org/'><protocolo>{protocol_number}</protocolo></ConsultarProtocolo></soap12:Body></soap12:Envelope>"""
    cert_pem, key_pem = _pfx_to_temp_pem(os.environ.get("PFX_PATH"), os.environ.get("PFX_PASS"))
    try:
        resp = requests.post(WS_CONSULT_URL, data=envelope.encode('utf-8'), headers={'Content-Type':'application/soap+xml; charset=utf-8'}, cert=(cert_pem,key_pem), verify=True, timeout=60)
        return resp
    finally:
        try:
            os.unlink(cert_pem); os.unlink(key_pem)
        except Exception:
            pass