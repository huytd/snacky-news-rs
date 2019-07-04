import './styles/main.scss';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import moment from 'moment';

const getDomainFromUrl = url => {
    let url_parts = url.replace(/https?\:\/\/(www.)?/g, '').split('/');
    return url_parts[0];
};

const trimByWords = (text, length) => {
    const words = text.split(/\s/);
    const ellipse = words.length >= length ? "..." : "";
    return words.splice(0, length).join(" ") + ellipse;
};

const getSelectedText = () => {
    let text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
};

const copyToClipboard = (input) => {
    let el = document.createElement('textarea');
    
    el.value = input;
    
    // Prevent keyboard from showing on mobile
    el.setAttribute('readonly', '');
    
    el.style.contain = 'strict';
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    el.style.fontSize = '12pt'; // Prevent zooming on iOS
    
    let selection = getSelection();
    let originalRange = false;
    if (selection.rangeCount > 0) {
        originalRange = selection.getRangeAt(0);
    }
    
    document.body.appendChild(el);
    el.select();
    
    // Explicit selection workaround for iOS
    el.selectionStart = 0;
    el.selectionEnd = input.length;
    
    let success = false;
    try {
        success = document.execCommand('copy');
    } catch (err) {}
    
    document.body.removeChild(el);
    
    if (originalRange) {
        selection.removeAllRanges();
        selection.addRange(originalRange);
    }

    return success;
};

const DESC_WORDS_COUNT = 50;

const Reader = props => {
    if (props.article) {
        const article = props.article;
        return (<div className="fixed w-screen h-screen overflow-scroll font-serif text-lg z-50">
            <div className="bg-white w-1/2 mx-auto p-10 rounded-lg shadow-xl" onClick={(e) => { e.stopPropagation(); }}>
                <h1>{article.title}</h1>
                <div className="text-gray-500">{moment(article.published).format("LLL")} on <a className="text-gray-800" href={article.url} rel="noref" target="_blank">{getDomainFromUrl(article.url)}</a></div>
                <div onMouseUp={() => {
                    const textToCopy = getSelectedText();
                    if (textToCopy.length) {
                        copyToClipboard(`${textToCopy} ${article.url}`);
                    }
                }} className="article-content my-5" dangerouslySetInnerHTML={{__html: article.content}}></div>
            </div>
        </div>);
    }
    return null;
}

const App = () => {
    const [ data, setData ] = useState({ articles: [] });
    const [ topic, setTopic ] = useState('everything');
    const [ readMode, setReadMode ] = useState({ article: null });

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios(`/api/articles/${topic}`);
            setData(result.data);
        };

        fetchData();
    }, [topic, readMode]);

    return (
    <div className="container flex flex-col w-screen relative" onClick={() => { setReadMode({ article: null }); }}>
        <Reader article={readMode.article} />
        <div className="header w-screen bg-gray-100 p-5">
            <div className="w-1/2 mx-auto">
                <ul className="flex font-sans">
                    <li className={`px-4 py-2 m-2 rounded-full border-2 nav-article-topic ${topic == 'everything' ? 'active' : ''}`}><a onClick={() => {setTopic('everything')}}>Everything</a></li>
                    <li className={`px-4 py-2 m-2 rounded-full border-2 nav-article-topic ${topic == 'vietnamese' ? 'active' : ''}`}><a onClick={() => {setTopic('vietnamese')}}>Vietnamese</a></li>
                    <li className={`px-4 py-2 m-2 rounded-full border-2 nav-article-topic ${topic == 'financial' ? 'active' : ''}`}><a onClick={() => {setTopic('financial')}}>Financial</a></li>
                    <li className={`px-4 py-2 m-2 rounded-full border-2 nav-article-topic ${topic == 'technical' ? 'active' : ''}`}><a onClick={() => {setTopic('technical')}}>Technical</a></li>
                    <li className={`px-4 py-2 m-2 rounded-full border-2 nav-article-topic ${topic == 'other' ? 'active' : ''}`}><a onClick={() => {setTopic('other')}}>Others</a></li>
                </ul>
            </div>
        </div>
        <div className="main-content w-screen flex-1 bg-gray-400 font-serif text-lg">
            <div className="w-1/2 mx-auto p-5">
                {!data.articles.length ? (<div className="h-screen content-center">Nothing here, please get back later!</div>) : ("")}
                {data.articles.map((article, i) => (
                    <div key={i} className="article-card cursor-pointer flex flex-row" onClick={(e) => { setReadMode({ article : article }); e.stopPropagation(); }}>
                        <div className="flex-1">
                            <h4>{article.title}</h4>
                            <div className="my-2">{trimByWords(article.text, DESC_WORDS_COUNT)}</div>
                            <div className="block font-sans text-gray-600"><span>{getDomainFromUrl(article.url)}</span>&nbsp;<span>{moment(article.published).toNow()}</span></div>
                        </div>
                        {article.image ? (<div className="font-sans image-cover ml-3 overflow-hidden"><img src={article.image} /></div>) : ("")}
                    </div>
                ))}
            </div>
        </div>
    </div>
    )
};

ReactDOM.render(<App/>, document.querySelector("#root"));