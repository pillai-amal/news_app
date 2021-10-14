const PORT = 8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const { get } = require('cheerio/lib/api/traversing')
const { response } = require('express')

const app = express()

const articles = []
const newspapers = [
    {
        name: 'thetimes',
        address: 'https://www.thetimes.co.uk/environment/climate-change',
        base: '',
    },
    {
        name: 'thegaurdian',
        address: 'https://www.theguardian.com/environment/climate-crisis',
        base: '',
    },
    {
        name: 'thetelegraph',
        address: 'https://www.telegraph.co.uk/climate-change/',
        base: 'https://www.telegraph.co.uk',
    },
]

newspapers.forEach(newspaper => {
    axios.get(newspaper.address)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            $('a:contains("emission")', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')

                articles.push({
                    title,
                    url: newspaper.base + url,
                    source: newspaper.name
                })
            })
        })
})

app.get('/',(req,res) => {
    res.json('Welcome to my page')
})


app.get('/news', (req,res) => {
    res.json(articles)
})
app.get('/news/:newspaperId', async(req,res) => {
    const newspaperId = req.params.newspaperId
    const newspaperadress = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].address
    const newspaperbase = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].base
    axios.get(newspaperadress)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const specificarticles = []
            $('a:contains("climate")', html).each(function () {
                const title = $(this).title
                const url = $(this).attr('href')
                specificarticles.push({
                    title,
                    url: newspaperbase + url,
                    source: newspaperId
                })
            })
            res.json(specificarticles)
        })
})

app.listen(PORT, () => console.log('sever runnning on PORT {PORT}'))