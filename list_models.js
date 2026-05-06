import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: "AIzaSyCacOau_Sz7gdFqMXkhFZPjSvGHLsypxPE" });

async function list() {
    try {
        const models = await ai.models.list();
        for await (const model of models) {
            console.log(model.name);
        }
    } catch (e) {
        console.error(e);
    }
}

list();
