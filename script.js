function find_all_xml_path() {
    reset_OutBx("xml_path_finder");
    try {

        let xml_paths_in_textArea_format = "";
        function loopEachXMLNode(node, path = '') {

            if (node.nodeType === 1) {
                let newXpath = path + "/" + node.nodeName;

                //Check if there is any attribute
                if (node.attributes.length > 0) {
                    for (let attribute of node.attributes) {
                        //console.log(`${newXpath}/@${attribute.name} = ${attribute.value}`)
                        xml_paths_in_textArea_format = xml_paths_in_textArea_format + newXpath + `@` + attribute.name + " : " + attribute.value + `\n`;
                    }
                }

                if (node.children.length === 0) {
                    //console.log(`${newXpath} = ${node.textContent.trim()}`)

                    xml_paths_in_textArea_format = xml_paths_in_textArea_format + newXpath + " : " + node.textContent.trim() + `\n`;
                }
                else {
                    for (let childNode of node.children) {
                        loopEachXMLNode(childNode, newXpath);
                    }
                }
            }
        }

        //Extract XML
        let section = document.getElementById("xml_path_finder");
        let input = section.querySelector("#txtInp"); //getElementById("txtInp")

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(input.value, "text/xml");

        //check for error
        const parseError = xmlDoc.getElementsByTagName('parsererror');
        if (parseError.length > 0) {
            let erorMessage = parseError[0].textContent;
            throw new Error(erorMessage);
        }

        loopEachXMLNode(xmlDoc.documentElement);

        section.querySelector("#txtOut").value = xml_paths_in_textArea_format;

    }
    catch (err) {
        console.log("master error")
        display_error_invalidXML(err.message);
    }
}

function formatXML() {
    reset_OutBx("xml_path_finder");
    try {
        let section = document.getElementById("xml_path_finder");
        let inpElement = section.querySelector("#txtInp");

        var xmlDoc = new DOMParser().parseFromString(inpElement.value, 'application/xml');

        //check for error
        const parseError = xmlDoc.getElementsByTagName('parsererror');
        if (parseError.length > 0) {
            let erorMessage = parseError[0].textContent;
            throw new Error(erorMessage);
        }

        var xsltDoc = new DOMParser().parseFromString([
            // describes how we want to modify the XML - indent everything
            '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
            '  <xsl:strip-space elements="*"/>',
            '  <xsl:template match="para[content-style][not(text())]">', // change to just text() to strip space in text nodes
            '    <xsl:value-of select="normalize-space(.)"/>',
            '  </xsl:template>',
            '  <xsl:template match="node()|@*">',
            '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
            '  </xsl:template>',
            '  <xsl:output indent="yes"/>',
            '</xsl:stylesheet>',
        ].join('\n'), 'application/xml');

        var xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet(xsltDoc);
        var resultDoc = xsltProcessor.transformToDocument(xmlDoc);
        var resultXml = new XMLSerializer().serializeToString(resultDoc);

        inpElement.value = resultXml;

    }
    catch (err) {
        display_error_invalidXML(err.message)
    }

}

function clearText(event) {

    let section = event.target.closest('div[class="section"]');

    // document.getElementById("txtInp").value = '';
    // document.getElementById("txtOut").value = '';

    section.querySelector("#txtInp").value = '';
    section.querySelector("#txtOut").value = '';
}

function copyAll(event) {

    let section = event.target.closest('div[class="section"]');

    let outBx = section.querySelector("#txtOut");
    // outBx.select();
    // document.execCommand('copy');

    if (outBx.value.trim() === "") {
        display_st_noData(event)
    }
    else {
        navigator.clipboard.writeText(outBx.value)

        display_st_copySucess(event);
    }

}

function copyOnlyPath(event) {
    let pathStr = "";

    let section = event.target.closest('div[class="section"]');
    let outBx = section.querySelector("#txtOut");

    let outputVal = outBx.value;
    //console.log(`${outputVal}`)

    if (outputVal.trim() === "") {
        display_st_noData(event);
    }
    else {
        let pathsLine_array = outputVal.split("\n");

        pathsLine_array.forEach(function (item) {
            let path = item.split(":")[0].trim();
            pathStr = pathStr + path + "\n";
        });

        navigator.clipboard.writeText(pathStr)

        display_st_copySucess(event);
    }

}

function display_st_copySucess(event) {

    let section = event.target.closest('div[class="section"]');

    section.querySelector("#op_st_text").style.color = 'green';
    section.querySelector("#op_st_text").innerText = "Copied!!"

    setTimeout(function () {
        section.querySelector("#op_st_text").innerText = ""
    }, 2000);
}

function display_st_noData(event) {

    let section = event.target.closest('div[class="section"]');

    section.querySelector("#op_st_text").style.color = 'red';
    section.querySelector("#op_st_text").innerText = "No Data!!"

    setTimeout(function () {
        section.querySelector("#op_st_text").innerText = ""
    }, 2000);
}

function display_error_invalidXML(errMsg) {
    
    let section = document.getElementById("xml_path_finder");
    let outBx = section.querySelector("#txtOut");

    outBx.style.color = 'red';
    outBx.value = 'An Error Occurred!! Error: ' + errMsg

}

function reset_OutBx(sectionID) {

    let section = document.getElementById(sectionID);
    
    let outBx = section.querySelector("#txtOut");

    outBx.style.color = '';
    outBx.value = '';
}

function find_all_json_path() {
    reset_OutBx("json_path_finder");
    try {
        let json_paths_in_textArea_format = "";
        function loop_each_json_element(obj, path = "") {

            if (typeof obj === "object" && obj != null) {

                if (Array.isArray(obj)) {
                    obj.forEach((item, index) => {
                        loop_each_json_element(item, `${path}[${index}]`);
                    });
                }
                else {
                    Object.keys(obj).forEach(key => {
                        loop_each_json_element(obj[key], path ? `${path}.${key}` : key);
                    });
                }
            } else {
                //console.log(`${path} = ${obj}`)
                json_paths_in_textArea_format = json_paths_in_textArea_format + path + " : " + obj + `\n`;
            }

            // return json_paths_in_textArea_format;
        }

        //Extract XML
        let section = document.getElementById("json_path_finder");
        let input = section.querySelector("#txtInp")

        let jsonObject = JSON.parse(input.value)

        loop_each_json_element(jsonObject)

        section.querySelector("#txtOut").value = json_paths_in_textArea_format;
    }
    catch (err) {
        display_error_invalidJSON(err.message);
    }
}

// function clearText(){
//     document.getElementById("txtInp").value = '';
//     document.getElementById("txtOut").value = '';
// }

// function copyAll(){

//     let outBx = document.getElementById("txtOut");
//     // outBx.select();
//     // document.execCommand('copy');

//     if(outBx.value.trim()===""){
//         display_st_noData()
//     }
//     else{
//         navigator.clipboard.writeText(outBx.value)

//         display_st_copySucess();
//     }

// }

// function copyOnlyPath(){
//     let jsonPath_str = "";

//     let outBx = document.getElementById("txtOut");

//     let outputVal = outBx.value;
//     //console.log(`${outputVal}`)

//     if(outputVal.trim()===""){
//         display_st_noData();
//     }
//     else{
//         let jsonPathsLine_array = outputVal.split("\n");

//         jsonPathsLine_array.forEach(function(item){
//             let jsonPath  = item.split(":")[0].trim();
//             //console.log(jsonPath);
//             jsonPath_str = jsonPath_str + jsonPath + "\n";
//         });

//         navigator.clipboard.writeText(jsonPath_str)

//         display_st_copySucess();
//     }

// }

function formatJSON() {
    reset_OutBx("json_path_finder");
    try {
        let section = document.getElementById("json_path_finder");
        let inpElement = section.querySelector("#txtInp");

        let jsonObj = JSON.parse(inpElement.value);

        let json_formatted_str = JSON.stringify(jsonObj, null, 4);

        console.log(json_formatted_str)

        inpElement.value = json_formatted_str;
    }
    catch (err) {
        display_error_invalidJSON(err.message)
    }

}

// function display_st_copySucess() {
//     document.getElementById("op_st_text").style.color = 'green';
//     document.getElementById("op_st_text").innerText = "Copied!!"

//     setTimeout(function () {
//         document.getElementById("op_st_text").innerText = ""
//     }, 2000);
// }

// function display_st_noData() {

//     document.getElementById("op_st_text").style.color = 'red';
//     document.getElementById("op_st_text").innerText = "No Data!!"

//     setTimeout(function () {
//         document.getElementById("op_st_text").innerText = ""
//     }, 2000);
// }

function display_error_invalidJSON(errMsg) {

    let section = document.getElementById("json_path_finder");
    let outBx = section.querySelector("#txtOut");

    outBx.style.color = 'red';
    outBx.value = 'An Error Occurred!! Error: ' + errMsg

}

function enable_section(sectionID) {

    let contentSec = document.getElementById("contentSec");

    let sections = contentSec.children;

    for (let sec of sections) {
        sec.style.display = 'none';
    }

    let xmlSection = document.getElementById(sectionID);
    xmlSection.style.display = 'block';

    contentSec.style.display = 'block';

}