import {Query_Course_CoursePlayerPage_Course} from "../graphql/types";
import {fetchBlob, fs} from "../mocks";
import {ContentTypeEnum} from "../types/contentType.enum";

type MediaArray = {
    path: string
    value: string
}

export const urlToBase64 = (url: string): Promise<string | ArrayBuffer | null> => {
    return fetch(url)
        .then(response => response.blob())
        .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject
            console.log(blob)
            return reader.readAsDataURL(blob)
        }))
}

export const replaceHttpsPrefixToFile = (url: string) => {
    return url.replace(/^https?:\/\//, 'file://')
}

export const writeToStorage = async (path: string, data: any[] | string) => {
    await fs.writeFile(path, JSON.stringify(data));
}

const writeContent = async (path: ContentTypeEnum, content: {}) => {
    let data: any[] = []
    const response = await fs.readFile(path)

    if(response && response.length) {
        data = [...JSON.parse(response)]
    }

    data.push(content);
    await writeToStorage(path, data);
}

export const setContent = async (key: ContentTypeEnum, content: Query_Course_CoursePlayerPage_Course | undefined) => {
    if (!content) return;

    const data: Query_Course_CoursePlayerPage_Course = JSON.parse(JSON.stringify(content))
    const mediaArray: MediaArray[] = []

    if (data.image) {
        const replacedUrl = replaceHttpsPrefixToFile(data.image.processed_url);

        mediaArray.push({path: replacedUrl, value: data.image.processed_url})
        data.image.processed_url = replacedUrl
    }

    if (data.teachers) {
        data.teachers.map(item => {
            if (!item) {
                return
            }
            const replacedUrl = replaceHttpsPrefixToFile(item.image.processed_url);

            mediaArray.push({path: replacedUrl, value: item.image.processed_url})
            item.image.processed_url = replaceHttpsPrefixToFile(item.image.processed_url)
        })
    }

    await writeContent(key, data)

    mediaArray.map(async (media) => {
        await urlToBase64(media.value).then(result => {
            fetchBlob(result as string, media.path)
            console.log(result)
        })
    })

    return {data, mediaArray}
    console.log('data', data)
}