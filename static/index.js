import './styles/main.scss';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import moment from 'moment';

const FULL_PAGE_ARTICLE = (article) => article.text.length >= 7000;
const HALF_PAGE_ARTICLE = (article) => article.text.length >= 5000 && article.text.length < 7000;
const ONE_THIRD_ARTICLE = (article) => article.text.length >= 2500 && article.text.length < 5000;
const ONE_FOURTH_ARTICLE = (article) => article.text.length < 2500;

Array.prototype.take = function(n) {
    const ret = this.splice(0, n);
    return ret;
};

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

const FullPageLayout = (props) => {
    const [first] = props.articles.one.take(1);
    const [second] = props.articles.four.take(1);
    return (
        <div className="flex flex-row border-b border-gray-500 py-5">
            <div className="article-left flex-1 border-r border-gray-500 pr-5">
                <h4 className="my-2">{first.title}</h4>
                <div className="three-columns text-justify">
                    {first.image && (<div className="image-cover mb-4 overflow-hidden"><img src={first.image} /></div>)}
                    {first.text.replace(/\n/g, "\n\n")}
                </div>
            </div>
            <div className="article-right w-1/4 pl-5">
                <h4 className="my-2">{second.title}</h4>
                <div className="two-columns text-justify">
                    {second.image && (<div className="image-cover mb-4 overflow-hidden"><img src={second.image} /></div>)}
                    {second.text.replace(/\n/g, "\n\n")}
                </div>
            </div>
        </div>
    );
};

const FullPageLayoutLeft = (props) => {
    const [first] = props.articles.one.take(1);
    const [second, third, fourth] = props.articles.four.take(3);
    return (
        <div className="flex flex-row border-b border-gray-500 py-5">
            <div className="article-left w-2/5 border-r border-gray-500 pr-5">
                <h5 className="my-2">{second.title}</h5>
                <div className="three-columns text-justify">
                    {second.image && (<div className="image-cover mb-4 overflow-hidden"><img src={second.image} /></div>)}
                    {second.text.replace(/\n/g, "\n\n")}
                </div>
                <h5 className="my-2">{third.title}</h5>
                <div className="three-columns text-justify">
                    {third.image && (<div className="image-cover mb-4 overflow-hidden"><img src={third.image} /></div>)}
                    {third.text.replace(/\n/g, "\n\n")}
                </div>
                <h5 className="my-2">{fourth.title}</h5>
                <div className="three-columns text-justify">
                    {fourth.image && (<div className="image-cover mb-4 overflow-hidden"><img src={fourth.image} /></div>)}
                    {fourth.text.replace(/\n/g, "\n\n")}
                </div>
            </div>
            <div className="article-right flex-1 pl-5">
                <h4 className="my-2">{first.title}</h4>
                <div className="four-columns text-justify">
                    {first.image && (<div className="image-cover mb-4 overflow-hidden"><img src={first.image} /></div>)}
                    {first.text.replace(/\n/g, "\n\n")}
                </div>
            </div>
        </div>
    );
};

const TripleLayout = (props) => {
    const [first, second, third] = props.articles.take(3);
    return (
        <div className="three-items border-b border-gray-500 py-5">
            <div className="six-columns">
                {first && <>
                    <h4 className="my-2">{first.title}</h4>
                    <div className="my-4 text-justify">
                        {first.image && (<div className="image-cover mb-4 overflow-hidden"><img src={first.image} /></div>)}
                        {first.text.replace(/\n/g, "\n\n")}
                    </div>
                </>}
                {second && <>
                    <h4 className="my-2">{second.title}</h4>
                    <div className="my-4 text-justify">
                        {second.image && (<div className="image-cover mb-4 overflow-hidden"><img src={second.image} /></div>)}
                        {second.text.replace(/\n/g, "\n\n")}
                    </div>
                </>}
                {third && <>
                    <h4 className="my-2">{third.title}</h4>
                    <div className="my-4 text-justify">
                        {third.image && (<div className="image-cover mb-4 overflow-hidden"><img src={third.image} /></div>)}
                        {third.text.replace(/\n/g, "\n\n")}
                    </div>
                </>}
            </div>
        </div>
    );
};

const QuadLayout = (props) => {
    const [first, second, third, fourth] = props.articles.take(4);
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

const App = () => {
    const [ data, setData ] = useState({ articles: [] });
    const [ topic, setTopic ] = useState('everything');

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios(`/api/articles/${topic}`);
            setData(result.data);
        };

        fetchData();
    }, [topic]);

    // const one = data.articles.filter(FULL_PAGE_ARTICLE);
    // const two = data.articles.filter(HALF_PAGE_ARTICLE);
    // const three = data.articles.filter(ONE_THIRD_ARTICLE);
    // const four = data.articles.filter(ONE_FOURTH_ARTICLE);

    const Articles = () => {
        let groups = [];
        while (data.articles.length > 3) {
            groups.push(data.articles.take(3));
        }
        if (data.articles.length) groups.push(data.articles);
        return groups.length && groups.map((g, i) => <TripleLayout key={i} articles={g}/>);
    };

    return (
    <div className="w-full h-auto">
        <div className="header w-full p-5 font-serif">
            <div className="text-6xl font-bold mx-auto text-center" style={{ fontVariant: "small-caps" }}>The Large Print</div>
    <div className="text-base mx-auto text-center uppercase py-2 border-b-2 border-t-2 border-black" style={{ letterSpacing: "5px" }}>{moment(new Date()).format("dddd, MMMM Do YYYY")} | {data.articles.length} articles</div>
            {/* <div className="w-1/2 mx-auto">
                <ul className="flex font-sans">
                    <li className={`px-4 py-2 m-2 rounded-full border-2 nav-article-topic ${topic == 'everything' ? 'active' : ''}`}><a onClick={() => {setTopic('everything')}}>Everything</a></li>
                    <li className={`px-4 py-2 m-2 rounded-full border-2 nav-article-topic ${topic == 'vietnamese' ? 'active' : ''}`}><a onClick={() => {setTopic('vietnamese')}}>Vietnamese</a></li>
                    <li className={`px-4 py-2 m-2 rounded-full border-2 nav-article-topic ${topic == 'financial' ? 'active' : ''}`}><a onClick={() => {setTopic('financial')}}>Financial</a></li>
                    <li className={`px-4 py-2 m-2 rounded-full border-2 nav-article-topic ${topic == 'other' ? 'active' : ''}`}><a onClick={() => {setTopic('other')}}>Others</a></li>
                </ul>
            </div> */}
        </div>
        <div className="w-full font-serif text-base">
            <div className="flex-1 flex flex-col mx-auto p-5">
                {!data.articles.length ? (<div className="h-screen content-center">Nothing here, please get back later!</div>) : ("")}
                {/* {data.articles.length && <>
                    <FullPageLayout articles={{one, four}} />
                    <QuadLayout articles={four} />
                    <FullPageLayoutLeft articles={{ one, four }} />
                    <TripleLayout articles={three} />
                </>} */}
                <Articles/>
            </div>
        </div>
    </div>
    )
};

ReactDOM.render(<App/>, document.querySelector("#root"));