import torch
import torch.nn.functional as F
import os
import argparse
from tqdm import trange
from transformers import GPT2LMHeadModel
import numpy as np
import os
import pickle
import re
from collections import Counter
import random
from TFIDF import *


os.environ["CUDA_VISIBLE_DEVICES"] = "0,1,2,3"  # 此处设置程序使用哪些显卡



with open("/home/vindzilla/texts.txt", 'r') as f:
    candidates = f.readlines()
candidates = random.sample(candidates, 500)

def getMostSimilar(sen, chosen):
    img,tar = candidates[0].split("#")
    cur = tfidf_similarity(tar, sen)
    for can in candidates[1:]:
        tmp = tfidf_similarity(can.split("#")[1], tar)
        if(tmp > cur) and tar not in chosen:
            cur = tmp
            tar = can.split("#")[1]
            img = can.split("#")[0]
            chosen.add(tar)
    return img, chosen


def output_image_to_web(texts):
    texts_split = texts.split("\n")
    res = dict()
    res['dataArr'] = []
    img_chosen = set()

    for i in trange(len(texts_split)):
    #    for text in texts_split:
        text = texts_split[i]
        res_part = dict()
        if "):" in text:
            text_clean = text.split("):")[1]
        else:
            text_clean = text
        word_chosen = set()
        cnt = 0
        while cnt <= 20:
            img , word_chosen = getMostSimilar(text_clean, word_chosen)
            if img not in img_chosen:
                img_chosen.add(img)
                break
            cnt += 1
        path = "template/" + img + ".jpg"
        res_part['text'] = text
        res_part['image'] = path
        res['dataArr'].append(res_part)
    print(res)
    return res

def output_image_to_web_sote(texts):
    texts_split = texts.split("\n")
    res = dict()
    res['dataArr'] = []


    for text in texts_split:
        res_part = dict()
        res_part['text'] = text

        img = random.sample(candidates, 1)[0].split("#")[0]
        path = "template/" + img + ".jpg"
        res_part['image'] = path
        res['dataArr'].append(res_part)
    return res

######################

def is_word(word):
    for item in list(word):
        if item not in "qwertyuiopasdfghjklzxcvbnm":
            return False
    return True

def top_k_top_p_filtering(logits, top_k=0, top_p=0.0, filter_value=-float('Inf')):
    """ Filter a distribution of logits using top-k and/or nucleus (top-p) filtering
        Args:
            logits: logits distribution shape (vocabulary size)
            top_k > 0: keep only top k tokens with highest probability (top-k filtering).
            top_p > 0.0: keep the top tokens with cumulative probability >= top_p (nucleus filtering).
                Nucleus filtering is described in Holtzman et al. (http://arxiv.org/abs/1904.09751)
        From: https://gist.github.com/thomwolf/1a5a29f6962089e871b94cbd09daf317
    """
    assert logits.dim() == 1  # batch size 1 for now - could be updated for more but the code would be less clear
    top_k = min(top_k, logits.size(-1))  # Safety check
    if top_k > 0:
        # Remove all tokens with a probability less than the last token of the top-k
        indices_to_remove = logits < torch.topk(logits, top_k)[0][..., -1, None]
        logits[indices_to_remove] = filter_value

    if top_p > 0.0:
        sorted_logits, sorted_indices = torch.sort(logits, descending=True)
        cumulative_probs = torch.cumsum(F.softmax(sorted_logits, dim=-1), dim=-1)

        # Remove tokens with cumulative probability above the threshold
        sorted_indices_to_remove = cumulative_probs > top_p
        # Shift the indices to the right to keep also the first token above the threshold
        sorted_indices_to_remove[..., 1:] = sorted_indices_to_remove[..., :-1].clone()
        sorted_indices_to_remove[..., 0] = 0

        indices_to_remove = sorted_indices[sorted_indices_to_remove]
        logits[indices_to_remove] = filter_value
    return logits


def sample_sequence(model, context, length, n_ctx, tokenizer, temperature=1.0, top_k=30, top_p=0.0, repitition_penalty=1.0,
                    device='cpu'):
    context = torch.tensor(context, dtype=torch.long, device=device)
    context = context.unsqueeze(0)
    generated = context
    with torch.no_grad():
        for _ in trange(length):
            inputs = {'input_ids': generated[0][-(n_ctx - 1):].unsqueeze(0)}
            outputs = model(
                **inputs)  # Note: we could also use 'past' with GPT-2/Transfo-XL/XLNet (cached hidden-states)
            next_token_logits = outputs[0][0, -1, :]
            for id in set(generated):
                next_token_logits[id] /= repitition_penalty
            next_token_logits = next_token_logits / temperature
            next_token_logits[tokenizer.convert_tokens_to_ids('[UNK]')] = -float('Inf')
            filtered_logits = top_k_top_p_filtering(next_token_logits, top_k=top_k, top_p=top_p)
            next_token = torch.multinomial(F.softmax(filtered_logits, dim=-1), num_samples=1)
            generated = torch.cat((generated, next_token.unsqueeze(0)), dim=1)
    return generated



def word2story(initial):
    # initial = " "
    parser = argparse.ArgumentParser()
    parser.add_argument('--device', default='0,1,2,3', type=str, required=False, help='设置使用哪些显卡')
    # parser.add_argument('--length', default=-1, type=int, required=False, help='生成长度')
    parser.add_argument('--length', default=800, type=int, required=False, help='生成长度')
    parser.add_argument('--temperature', default=0.5, type=float, required=False, help='生成温度，越高越随机')
    parser.add_argument('--topk', default=6, type=int, required=False, help='生成的时候最高几选一')
    parser.add_argument('--topp', default=0, type=float, required=False, help='生成的时候积累概率最高多少')
    parser.add_argument('--model_config', default='/home/vindzilla/GPT/config/model_config_small.json', type=str, required=False,
                        help='模型参数路径')
    parser.add_argument('--tokenizer_path', default='/home/vindzilla/GPT/cache/vocab_small.txt', type=str, required=False, help='词表路径')
    # parser.add_argument('--model_path', default='model/final_model', type=str, required=False, help='模型路径')
    parser.add_argument('--model_path', default='/home/vindzilla/GPT/model/model_epoch3', type=str, required=False, help='模型路径')
    parser.add_argument('--save_path', default='/home/vindzilla/GPT/generated/', type=str, required=False, help='存放生成的文件的路径')
    parser.add_argument('--articles_per_title', default=1, type=int, required=False, help='每个标题生成多少篇文章')
    parser.add_argument('--titles', default=initial, type=str, required=False, help='标题列表，是一个字符串，用空格分开')
    parser.add_argument('--titles_file', default='', type=str, required=False,
                        help='标题列表文件，文件中每行一个标题。如果这个选项有值则titles无效')
    parser.add_argument('--no_wordpiece', action='store_true', help='不做word piece切词')
    parser.add_argument('--segment', action='store_true', help='中文以词为单位')
    parser.add_argument('--repetition_penalty', default=1, type=float, required=False)

    args = parser.parse_args()
    if args.segment:
        from tokenizations import tokenization_bert_word_level as tokenization_bert
    else:
        from tokenizations import tokenization_bert

    os.environ["CUDA_VISIBLE_DEVICES"] = args.device  # 此处设置程序使用哪些显卡
    length = args.length
    temperature = args.temperature
    topk = args.topk
    topp = args.topp
    repetition_penalty = args.repetition_penalty

    titles = args.titles.split("#")  # 列表，里面每个元素是一个生成的标题
    if args.titles_file:
        with open(args.titles_file, 'r') as f:
            titles = [line.strip('\n') for line in f.readlines()]
    articles_per_title = args.articles_per_title  # 这里定义一个标题生成多少篇文章
    save_path = args.save_path  # 设置存到哪

    device = "cuda" if torch.cuda.is_available() else "cpu"

    tokenizer = tokenization_bert.BertTokenizer(vocab_file=args.tokenizer_path)
    model = GPT2LMHeadModel.from_pretrained(args.model_path)
    model.to(device)
    model.eval()

    n_ctx = model.config.n_ctx

    if not os.path.exists(save_path):
        os.mkdir(save_path)
    if length == -1:
        length = model.config.n_ctx

    for i, title in enumerate(titles):
        for j in range(articles_per_title):
            with open(save_path + str(i) + '-' + str(j) + '.txt', 'w') as f:
                context_tokens = tokenizer.convert_tokens_to_ids(tokenizer.tokenize(title))
                generated = 0
                out = sample_sequence(
                    n_ctx=n_ctx,
                    model=model, length=length,
                    context=context_tokens, tokenizer=tokenizer,
                    temperature=temperature, top_k=topk, top_p=topp, repitition_penalty=repetition_penalty,
                    device=device
                )
                out = out.tolist()[0]

                generated += 1
                text = tokenizer.convert_ids_to_tokens(out)
                # print(text)

                for i, item in enumerate(text[:-1]):  # 确保英文前后有空格
                    if is_word(item) and is_word(text[i + 1]):
                        text[i] = item + ' '
                    if item[0] == "#" and is_word(text[i + 1]):
                        text[i] = item + ' '
                    if item[-1] == "#" and is_word(text[i - 1]):
                        text[i] = " " + item

                for i, item in enumerate(text):
                    if item == '[MASK]':
                        text[i] = ''
                    if item == '[CLS]' or item == '[SEP]':
                        text[i] = '\n'


                text = ''.join(text).replace('##', '').strip()
                # text = ''.join(text.split('\n')[:-1])
                # print(text)

                # res = output_image_to_web(text)
                res = output_image_to_web_sote(text)
                print(res)
                import pickle
                output = open('data.pkl', 'wb')
                pickle.dump(res, output)
                return res


initial = "mom"
if __name__ == '__main__':
    word2story(initial)
