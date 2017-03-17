import jieba.analyse
import json
import csv


def convert_train_data(dic):
    """
        IN : Q&A, dict
        Out : json
    """
    dataRead = load()
    pre_node = ""
    intentData = {}
    for question, answer in dic.items():
        jieba.analyse.set_stop_words('C:/Users/IBM_ADMIN/Desktop/jzh/slack/stopwords.txt')
        intent = jieba.analyse.extract_tags(question, topK=1)[0]
        intentData[intent] = question

        for i in dataRead["dialog_nodes"]:
            if i["conditions"] == "anything_else":
                pre_node = i["previous_sibling"]
        text_struct = {
            "text": question,
            "created": "",
            "updated": ""
        }
        intent_struct = {
            "intent": intent,
            "created": "",
            "updated": "",
            "example": [text_struct],
            "description": None
        }
        dialog_node_struct = {
            "go_to": None,
            "output": {"text": answer},
            "parent": None,
            "context": None,
            "created": "",
            "updated": "",
            "metadata": None,
            "conditions": "#" + intent,
            "description": None,
            "dialog_node": intent + "_node",
            "previous_sibling": pre_node
        }
        print dialog_node_struct
        for j in dataRead['intents']:
            if j['intent'] == intent:
                for k in dataRead["dialog_nodes"]:
                    if k['dialog_node'] == intent + "_node":
                        k["output"]["text"] = answer
                    elif dataRead["dialog_nodes"].index(k) == len(dataRead["dialog_nodes"]) - 1:
                        print dialog_node_struct
                        dataRead["dialog_nodes"].append(dialog_node_struct)
                break
            elif dataRead["intents"].index(j) == len(dataRead["intents"]) - 1:
                dataRead['intents'].append(intent_struct)
        for i in dataRead["dialog_nodes"]:
            if i["conditions"] == "anything_else":
                i["previous_sibling"] = intent + "_node"
    dataRead["name"] = "slackTest"
    store(dataRead)
    write_to_csv(intentData)


def store(data):
    with open("C:/Users/IBM_ADMIN/Desktop/jzh/slack/workspace.json", "w") as json_file:
        json_file.write(json.dumps(data))


def load():
    with open("C:/Users/IBM_ADMIN/Desktop/jzh/slack/workspace-91fe1cea-20cf-482b-9adf-b2fb1554c223.json") as json_file:
        dataload = json.load(json_file)
        return dataload


def write_to_csv(intentData):
    writer = csv.writer(file('C:/Users/IBM_ADMIN/Desktop/jzh/slack/intent.csv', 'wb'))
    for k, v in intentData.items():
        writer.writerow([v.encode('utf-8'), k.encode('utf-8')])


if __name__ == '__main__':
    data = {"what is the temperature?": "The temperature in this room is twenty degrees centigrade.",
            "What's the temperature?": "The temperature in this room is twenty degrees centigrade.",
            "when will the meeting start?": "5 PM",
            "what time is it?": "3 AM"}
    convert_train_data(data)
