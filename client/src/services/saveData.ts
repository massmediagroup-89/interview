import {fs} from "../mocks";
import { Article, Class, Course, Meditation } from '../components'

export type MediaArray = {
    path: string
    value: string
}

export const replaceHttpsPrefixToFile = (url: string) => {
    return url.replace(/^(https?:\/\/|http?:\/\/)/, 'file://')
}

export const replaceHttpToSpace = (url: string) => {
    return url.replace(/^(https?:\/\/|http?:\/\/)/, '')
}

export const urlToBase64 = (url: string): Promise<string | ArrayBuffer | null> => {
    return fetch(url)
        .then(response => response.blob())
        .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject

            return reader.readAsDataURL(blob)
        }))
}

export const writeToStorage = async (path: string, data: any[] | string) => {
    await fs.writeFile(path, JSON.stringify(data));
}

export const writeContent = async (path: string, content: Course | Meditation | Class | Article) => {
    let data: any[] = []
    const response = await fs.readFile(path)

    if(response && response.length) {
        data = [...JSON.parse(response)]
    }
    if (data.find(item => item.id === content.id)) {
        return
    }

    data.push(content);
    await writeToStorage(path, data);
}
