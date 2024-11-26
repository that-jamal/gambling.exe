import { sql } from '@vercel/postgres';


export async function POST(req: Request) {
    const data = await req.json()
    console.log(data)
    await sql` INSERT INTO saved_coins(coins) values(${data});`;
    return new Response(JSON.stringify(data))
}

