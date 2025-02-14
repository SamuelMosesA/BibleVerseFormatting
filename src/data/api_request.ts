import { Verse } from "./types";

const verse_parsing_regex = RegExp(/\[(?<verse_num>\d+)\](?<text>[^\[\]]+)/, "g")
const double_newline = RegExp(/\n\s*\n/, "g")

function parse_api_result(passage_str: string): Verse[]{
    let passage_str_trim = passage_str.replace(double_newline, "\n")
    const matched_verses = passage_str_trim.matchAll(verse_parsing_regex)
    let result: Verse[] = []
    matched_verses.forEach((val) => {
        if(val.groups){
            result.push({
                verseNumber: val.groups["verse_num"],
                text: val.groups["text"]
            })
        }
    })
    return result
}



export async function get_bible_verses_from_api(query: string): Promise<Verse[]>{
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Token fb26e7cc3170938cc359c7cfe9fc3342c67709d5");

    const requestURL = new URL("https://api.esv.org/v3/passage/text/")
    requestURL.searchParams.append("q",query)
    requestURL.searchParams.append("include-passage-references","false")
    requestURL.searchParams.append("include-footnotes","false")
    requestURL.searchParams.append("include-footnote-body","false")
    requestURL.searchParams.append("include-headings","false")
    requestURL.searchParams.append("include-short-copyright","false")
    requestURL.searchParams.append("include-selahs","false")
    requestURL.searchParams.append("indent-poetry","true")
    requestURL.searchParams.append("indent-using","tab")

    let apiReqeust = new Request(requestURL, {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    })

    const response = await fetch(apiReqeust)
    if(!response.ok){
        throw {
            error_code: response.status,
            msg: await response.text()
        }
    }

    const content = await response.json()
    if(!content['passages'] || content['passages'].length < 1){
        throw {
            error_code: 500,
            msg: "could not find data in passages response"
        }
    }
    return parse_api_result(content['passages'].at(0))
}