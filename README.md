# Story Teller
This is a **2020 Google Machine Learning Winter Camp** project.

This project belongs to **3-gram group**.

Our poster
https://drive.google.com/open?id=1LynrpNhNo5JzEkV29PL4QRTWojLNQ6-H

Our Presentation
https://drive.google.com/drive/folders/1r5wOlS3FMK37SPQxWH8x4HbjsqpTgdeK

## Project description
We designed a story generator. In our daily lives, we often encounter the breaking of comics and novels, while sometimes we are not satisfied with the ending arranged by the author. Inspired by the exciting development of AI, we have the idea that, why not design a story teller, and let everyone be a playwright?

The following picture shows the final system of our project. The user could enter some keywords, such as “adventure”, and the story teller will first generate some texts related to the keywords, with realism. Not only dialogues, our project will also provide vivid scenes. Note that our project can be easily extended to any text generate tasks, here we just take the corpus of “Simpsons” as an example.

![load fig failed](https://github.com/YimiAChack/story_teller/demo/show.png)

The technical framework is shown as follows. It consists of two main components. This first one is language model, and the second one is text-image retrieval model.

![load fig failed](https://github.com/YimiAChack/story_teller/demo/framework.png)


#### data
Simpsons image dataset
https://drive.google.com/open?id=1Z3dU_wtGLwRJJuYBdgbQ8lCIj463SUeG

Simpsons dialogue dataset
https://drive.google.com/open?id=1Gp9lhJS54oe8Zb42_I_LdjnncbvdymDH



## train
python train.py
