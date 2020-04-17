import './styles/main.scss';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import moment from 'moment';

const FULL_PAGE_ARTICLE = (article) => article.text.length >= 7000;
const HALF_PAGE_ARTICLE = (article) => article.text.length >= 5000 && article.text.length < 7000;
const ONE_THIRD_ARTICLE = (article) => article.text.length >= 2500 && article.text.length < 5000;
const ONE_FOURTH_ARTICLE = (article) => article.text.length < 2500;

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

const ThreeColumnCenter = (props) => {

};

const TripleLayout = (props) => {
    const [first, second, third, ...rest] = props.articles;
    return (
        <div className="flex flex-row three-items border-b border-gray-500 py-5">
            <div className="six-columns">
                <h4 className="my-2">{first.title}</h4>
                <div className="my-4 text-justify">{first.text.replace(/\n/g, "\n\n")}</div>
                <h4 className="my-2">{second.title}</h4>
                <div className="my-4 text-justify">{second.text.replace(/\n/g, "\n\n")}</div>
                <h4 className="my-2">{third.title}</h4>
                <div className="my-4 text-justify">{third.text.replace(/\n/g, "\n\n")}</div>
            </div>
        </div>
    );
};

const QuadLayout = (props) => {
    const [first, second, third, fourth, ...rest] = props.articles;
    return (
        <div className="flex flex-row three-items border-b border-gray-500 py-5">
            <div className="eight-columns">
                <h4 className="my-2">{first.title}</h4>
                <div className="my-4 text-justify">{first.text.replace(/\n/g, "\n\n")}</div>
                <h4 className="my-2">{second.title}</h4>
                <div className="my-4 text-justify">{second.text.replace(/\n/g, "\n\n")}</div>
                <h4 className="my-2">{third.title}</h4>
                <div className="my-4 text-justify">{third.text.replace(/\n/g, "\n\n")}</div>
                <h4 className="my-2">{fourth.title}</h4>
                <div className="my-4 text-justify">{fourth.text.replace(/\n/g, "\n\n")}</div>
            </div>
        </div>
    );
};

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

    console.log(data.articles);

    const fullPageArticles = data.articles.filter(FULL_PAGE_ARTICLE);
    const halfPageArticles = data.articles.filter(HALF_PAGE_ARTICLE);
    const oneThirdPageArticles = data.articles.filter(ONE_THIRD_ARTICLE);
    console.log("DBG", oneThirdPageArticles);
    const oneFourthPageArticles = data.articles.filter(ONE_FOURTH_ARTICLE);

    return (
    <div className="container flex flex-col w-screen relative">
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
        <div className="main-content w-screen flex-1 bg-gray-200 font-serif text-base">
            <div className="w-full mx-auto p-5">
                {!data.articles.length ? (<div className="h-screen content-center">Nothing here, please get back later!</div>) : ("")}
                {oneFourthPageArticles.length && <QuadLayout articles={oneFourthPageArticles} />}
                {oneThirdPageArticles.length && <TripleLayout articles={oneThirdPageArticles}/>}
                {/* {data.articles.map((article, i) => (
                    <div key={i} className="article-card cursor-pointer flex flex-row">
                        <div className="flex-1">
                            <h4>{article.title}</h4>
                            <div>{article.text.length}</div>
                            <div className="block font-sans text-gray-600"><span>{getDomainFromUrl(article.url)}</span>&nbsp;<span>{moment(article.published).toNow()}</span></div>
                            {article.image ? (<div className="font-sans image-cover ml-3 overflow-hidden"><img src={article.image} /></div>) : ("")}
                            <div className="my-2">{article.text}</div>
                        </div>
                    </div>
                ))} */}
            </div>
        </div>
    </div>
    )
};

ReactDOM.render(<App/>, document.querySelector("#root"));