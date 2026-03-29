import dotenv from 'dotenv'

dotenv.config({path: '../.env'})

const getZillowData = async (req, res) => {
    console.log("g")
    try{
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.zillowAPIKEY
            }
        }

        const budget = parseInt(req.params.budget)
        const location = req.params.location
        const keyword = location.replace(" ", "%20")
        const response = await fetch(`https://api.hasdata.com/scrape/zillow/listing?keyword=${keyword}&type=forRent&price[max]=${budget}`, options)
        const data = await response.json()

        console.log(data)
        res.status(200).json(data)
    }
    catch(err){
        res.status(409).json({error: err.message})
    }
}

export default {getZillowData}