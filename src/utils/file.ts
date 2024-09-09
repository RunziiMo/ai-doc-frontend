export const download = (url, fileName) => {
    try {
        let link = document.createElement("a");
        link.style.display = "none";
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
    } catch (err) {
        return false;
    }
};

export const exportToTxt = (data, filename) => {
    // 创建一个blob对象，类型为纯文本
    var blob = new Blob([data], { type: 'text/plain' });
 
    // 创建一个指向blob的URL
    var url = URL.createObjectURL(blob);
 
    download(url, filename)
    URL.revokeObjectURL(url);
}
 

/**
 * 导出word
 * @param {string | HTMLElement} domOrSelector 选择器或者DOM元素
 * @param {string} fileName 文件名，不含后缀
 * @param {string} style 样式
 */
 export const exportWord = (domOrSelector, fileName = "word", style = "") => {
    if (!domOrSelector) {
        return Promise.reject("缺少导出元素或者导出元素选择器");
    }

    const dom =
        typeof domOrSelector === "string"
        ? document.querySelector(domOrSelector)
        : domOrSelector;

    if (!dom) {
        return Promise.reject("未获取到元素选择器对应的元素");
    }

    const exportHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset='utf-8'>
                <title>${fileName}</title>
                ${style ? `<style>${style}</style>` : ""}
            </head>
            <body>
                ${dom.outerHTML}
            </body>
        </html>
    `;

    const url =
        "data:application/vnd.ms-word;charset=utf-8," +
        encodeURIComponent(exportHtml);

    download(url, fileName + ".doc");

    return Promise.resolve(true);
};