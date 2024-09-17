export const getSelectedTextInfos = (text: string, article: string) => {
    let sentences = article.split(/[。？！\n]/);

    // 过滤出包含特定文本的句子  
    const filteredSentences = sentences.filter(sentence => sentence.includes(text)).map(el => {
        const sentenceIndex = article.indexOf(el);
        const textStartIndex = sentenceIndex + el.indexOf(text);
        const textEndIndex = textStartIndex + text.length;
        return {
            replaced_text: text,
            start_index: textStartIndex,
            end_index: textEndIndex,
            window_text: el
        }
    });
    filteredSentences.forEach
   
  
    return filteredSentences;  
}