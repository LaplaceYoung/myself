async function testDouban() {
    try {
        const q = "灵山";
        const url = `https://frodo.douban.com/api/v2/search/subjects?q=${encodeURIComponent(q)}&type=book&apikey=054022eaeae0b00e0fc068c0c0a2102a`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'MicroMessenger/7.0.22.1840(0x27001636) Process/appbrand0 WeChat/ext/127 NetType/WIFI Language/zh_CN',
                'Referer': 'https://servicewechat.com/wx2f9b06c1de1ccfca/91/page-frame.html'
            }
        });
        const d = await response.json();

        d.subjects?.items?.slice(0, 2).forEach(item => {
            const target = item.target;
            if (target) {
                console.log({
                    title: target.title,
                    author: target.card_subtitle?.split(' / ')[0] || target.author_name || 'Unknown',
                    image: target.pic?.normal || target.cover_url,
                    desc: target.card_subtitle
                });
            }
        });
    } catch (e) {
        console.error(e);
    }
}
testDouban();
