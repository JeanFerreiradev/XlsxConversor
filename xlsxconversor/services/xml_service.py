import pandas as pd
from lxml import etree
from cryptography.hazmat.primitives.serialization import pkcs12
from cryptography.hazmat.primitives import serialization
from signxml import XMLSigner, methods
import warnings
warnings.filterwarnings("ignore", message="SHA1")
from dotenv import load_dotenv
import os
load_dotenv()

def _clean_tag(name):
    return ''.join(c if c.isalnum() else '_' for c in str(name))
def xlsx_to_bmp_xml(xlsx_path):
    xl = pd.ExcelFile(xlsx_path)
    root = etree.Element('RootBMP')
    a025 = etree.SubElement(root, 'a025')
    for sheet in xl.sheet_names:
        df = xl.parse(sheet)
        parent = etree.SubElement(a025, sheet)
        for idx, row in df.fillna('').iterrows():
            item = etree.SubElement(parent, sheet+'_item')
            for col in df.columns:
                tag = _clean_tag(col)
                val = row[col]
                if isinstance(val, float) and val.is_integer():
                    val = int(val)
                etree.SubElement(item, tag).text = str(val)
    return etree.tostring(root, encoding='utf-8', xml_declaration=True)
def sign_xml_with_pfx(xml_bytes, pfx_path=None, pfx_password=None, tag_to_sign='a025'):
    pfx_path = pfx_path or os.environ.get("PFX_PATH")
    pfx_password = pfx_password or os.environ.get("PFX_PASS")

    with open(pfx_path, 'rb') as f:
        pfx_data = f.read()

    private_key, cert, additional = pkcs12.load_key_and_certificates(
        pfx_data,
        pfx_password.encode() if pfx_password else None
    )

    if private_key is None or cert is None:
        raise ValueError('PFX não contém chave/certificado válidos.')

    # ✅ Converte o certificado para bytes PEM
    cert_pem = cert.public_bytes(encoding=serialization.Encoding.PEM)

    # Monta XML e assina
    root = etree.fromstring(xml_bytes)
    target = root.find('.//' + tag_to_sign)
    if target is None:
        raise ValueError(f'Tag {tag_to_sign} não encontrada.')

    target.set('Id', tag_to_sign)

    signer = XMLSigner(
        method=methods.enveloped,
        signature_algorithm='rsa-sha256',
        digest_algorithm='sha256'
    )

    signed_element = signer.sign(
        target,
        key=private_key,
        cert=cert_pem,  # <-- passa PEM, não o objeto
        reference_uri=f'#{tag_to_sign}'
    )

    parent = target.getparent()
    parent.replace(target, signed_element)

    return etree.tostring(root, encoding='utf-8', xml_declaration=True)
