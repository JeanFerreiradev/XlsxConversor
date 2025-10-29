import os, tempfile, requests
from cryptography.hazmat.primitives.serialization import pkcs12, Encoding, PrivateFormat, NoEncryption
from cryptography.hazmat.primitives import serialization
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


def send_bmp_xml(xml_bytes):
    # URLs do webservice (ajuste conforme o ambiente)
    url = os.environ.get("WS_SEND_URL", "https://homologacao.sefaz.es.gov.br/PetroleoGasWS/EnvioDocumento.asmx")

    # Caminho e senha do PFX
    pfx_path = os.environ.get("PFX_PATH")
    pfx_pass = os.environ.get("PFX_PASS")

    # Carrega o PFX
    with open(pfx_path, 'rb') as f:
        pfx_data = f.read()
    private_key, cert, _ = pkcs12.load_key_and_certificates(
        pfx_data,
        pfx_pass.encode() if pfx_pass else None
    )

    # Gera arquivos temporários .pem e .key
    key_file = tempfile.NamedTemporaryFile(delete=False, suffix=".key")
    cert_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pem")

    try:
        key_file.write(private_key.private_bytes(
            serialization.Encoding.PEM,
            serialization.PrivateFormat.TraditionalOpenSSL,
            serialization.NoEncryption()
        ))
        key_file.close()

        cert_file.write(cert.public_bytes(serialization.Encoding.PEM))
        cert_file.close()

        headers = {
            "Content-Type": "text/xml; charset=utf-8",
            "SOAPAction": "http://www.sefaz.es.gov.br/PetroleoGasWS/EnvioDocumento"  # conforme o manual
        }

        resp = requests.post(
            url,
            data=xml_bytes,
            headers=headers,
            cert=(cert_file.name, key_file.name),  # mutual TLS aqui!
            verify=True,  # mantém validação do servidor
            timeout=60
        )

        return resp

    finally:
        os.unlink(key_file.name)
        os.unlink(cert_file.name)


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