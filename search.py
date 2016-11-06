import urllib,urllib2
import json
import pprint
import json as simplejson


# data = urllib2.urlopen('https://www.googleapis.com/customsearch/v1?key=AIzaSyAikOvxJgTv4S1_Zn9D47oIadQkQfa3gxI&cx=005175589950435320673:pjhig1ltsts&q=lecture')
# data = json.load(data)
#
# # print(data["items"][0])
#
# item_list = data["items"]
# new_list = []
#
# for item in item_list:
#     item_title = item["title"] # item title
#     item_text = item["snippet"] # item text
#     item_link = item["link"] # item link
#
#     container = [item_title,item_text,item_link]
#     new_list.append(container)
#
# print(new_list[0][0])


def searchWeb(text,output,c):

    try:
        text = text.encode('utf-8')
    except:
        text =  text

    query = urllib.quote_plus(text)

    if len(query) > 60:
        return output,c

    #using googleapis for searching web
    base_url = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyAikOvxJgTv4S1_Zn9D47oIadQkQfa3gxI&cx=005175589950435320673:pjhig1ltsts&q='
    data = urllib2.urlopen(base_url + query)
    data = json.load(data)

    if data != "":
        item_list = data["items"]
        print(item_list[0])
    else:
        item_list = ""
        print("list empty")

    # print(item_list[0])

    #
    # try:
    #     if (len(item_list) and 'snippet' in item_list[0] and 'title' in item_list[0] and 'link' in item_list[0]):
    #         print('its working')
    #         for ele in item_list:
    #             Match = item_list[0]
    #             content = Match['snippet']
    #             url_match = Match['link']
    #
    #             if url_match in output:
    #                 output[url_match] = output[url_match] + 1
    #                 c[url_match] = (c[url_match]*(output[url_match] - 1) + cosineSim(text,strip_tags(content)))/(output[url_match])
    #             else:
    #                 output[url_match] = 1
    #                 c[url_match] = cosineSim(text,strip_tags(content))
    # except:
    #     return output,c
    # return output,c



#function test
text = "Cristiano Ronaldo dos Santos Aveiroborn 5 February 1985)"
output = "output"
c = "c"


res = searchWeb(text,output,c)
print(res)



# def searchWeb(text,output,c):
#     try:
#         text = text.encode('utf-8')
#     except:
#         text =  text
#     query = urllib.quote_plus(text)
#     if len(query)>60:
#         return output,c
#
#     #using googleapis for searching web
#     base_url = 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q='
#     # base_url = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyAikOvxJgTv4S1_Zn9D47oIadQkQfa3gxI&cx=005175589950435320673:pjhig1ltsts&q=saminu'
#     # base_url = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyAikOvxJgTv4S1_Zn9D47oIadQkQfa3gxI&cx=005175589950435320673:pjhig1ltsts&q='
#     url = base_url + '%22' + query + '%22'
#     # url = base_url + query + "'"
#     print(url)
#     request = urllib2.Request(url,None,{'Referer':'Google Chrome'})
#     response = urllib2.urlopen(request)
#     results = simplejson.load(response)
#
#     if ( len(results) and 'responseData' in results):
#         print("this is working")
#
#     try:
#         if ( len(results) and 'responseData' in results and 'results' in results['responseData'] and results['responseData']['results'] != []):
#             for ele in	results['responseData']['results']:
#                 Match = results['responseData']['results'][0]
#                 content = Match['content']
#                 if Match['url'] in output:
#                     #print text
#                     #print strip_tags(content)
#                     output[Match['url']] = output[Match['url']] + 1
#                     c[Match['url']] = (c[Match['url']]*(output[Match['url']] - 1) + cosineSim(text,strip_tags(content)))/(output[Match['url']])
#                 else:
#                     output[Match['url']] = 1
#                     c[Match['url']] = cosineSim(text,strip_tags(content))
#     except:
#         return output,c
#     return output,c