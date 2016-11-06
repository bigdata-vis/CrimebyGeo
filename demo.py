try:
    from xml.etree.cElementTree import XML
except ImportError:
    from xml.etree.ElementTree import XML
import zipfile


"""
Module that extract text from MS XML Word document (.docx).
(Inspired by python-docx <https://github.com/mikemaccana/python-docx>)
"""

WORD_NAMESPACE = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
PARA = WORD_NAMESPACE + 'p'
TEXT = WORD_NAMESPACE + 't'


def docxExtract(docxfile):
    """
    Take the path of a docx file as argument, return the text in unicode.
    """
    document = zipfile.ZipFile(docxfile)
    xml_content = document.read('word/document.xml')
    document.close()
    tree = XML(xml_content)

    paragraphs = []
    newparatextlist = []

    # print(tree.getiterator(PARA))
    for paragraph in tree.getiterator(PARA):
        texts = [node.text
                 for node in paragraph.getiterator(TEXT)
                 if node.text]
        if texts:
            paragraphs.append(''.join(texts))

            # Make explicit unicode version
            for paratext in paragraphs:
                newparatextlist.append(paratext.encode("utf-8"))

    return '\n'.join(newparatextlist)
    # return paragraphs

test = docxExtract('patch.docx')
print(test)

# def docxExtract(docxfile):
#     try:
#         document = opendocx(docxfile)
#     except:
#         print "Error opening docx"
#         exit()
#
#     # Fetch all the text out of the document we just created
#     paratextlist = getdocumenttext(document)
#
#     # Make explicit unicode version
#     newparatextlist = []
#     for paratext in paratextlist:
#         newparatextlist.append(paratext.encode("utf-8"))
#
#     # Print out text of document with two newlines under each paragraph
#     return '\n'.join(newparatextlist)