import express from 'express';
import Game from '../models/Game.js';
const router = express.Router();

//add game using post 

router.route("/add").post((req,res)=>{ 


  const title=req.body.title; //get title from request body
  const description=req.body.description;
  const ageGroup=(req.body.ageGroup);
  const rating=Number(req.body.rating);
  const difficultyLevel=req.body.difficultyLevel;
  const category=req.body.category;
  const Game_image=req.body.Game_image;
  const Game_URL=req.body.Game_URL;
  
  
  
 
 


//create new game object

  const newGame=new Game({ //create new game object
    title,
    description,
    ageGroup,
    rating,
    difficultyLevel,
    category,
    Game_image,
    Game_URL,
    
    

  })
     newGame.save().then(()=>{ //save to database
      res.json("Game Added") //response message
    }).catch((err)=>{ //catch error
      console.log(err);
    }) 


})

//read all games get method

router.route("/").get((req,res)=>{ //get all games using get
  Game.find().then((games)=>{ //find all games
    res.json(games) //response with json data
  }).catch((err)=>{ //catch error
    console.log(err);
  })

})
//update game
router.route("/update/:id").put(async(req,res)=>{ //update game using put
  let gameId=req.params.id; //get id from request params
  const{title,description,ageGroup,rating,difficultyLevel,category,Game_image,Game_URL,}=req.body; //destructure request body  get frontend data   

  const updateGame={ //create update game object
    title,
    description,
    ageGroup,
    rating,
    difficultyLevel,
    category,
    Game_image,
    Game_URL,
  }
  const update=await Game.findByIdAndUpdate(gameId,updateGame) //find game by id and update
  .then(()=>{ //then response
      res.status(200).send({status:"Game updated"}); //response message
  }).catch((err)=>{ //catch error
    console.log(err);
    res.status(500).send({status:"Error with updating data",error:err.message}); //response error message
  })
})

// export default router; //export the router (removed duplicate)
//delete game 
router.route("/delete/:id").delete(async(req,res)=>{ //delete game using delete
let gameId=req.params.id; //get id from request params
await Game.findByIdAndDelete(gameId)//find game by id and delete
.then(()=>{ //then response
  res.status(200).send({status:"Game deleted"}); //response message
}).catch((err)=>{ //catch error
  console.log(err.message);
  res.status(500).send({status:"Error with delete game",error:err.message}); //response error message
  })
})

router.route("/get/:id").get(async(req,res)=>{ //get game by id using get
 let gameId=req.params.id; //get id from request params   
 const game = await Game.findById(gameId) //find game by id
  .then((game)=>{ //then response
    res.status(200).send({status:"Game fetched",game}) //response message with game data
  }).catch((err)=>{ //catch error
    console.log(err.message);
    res.status(500).send({status:"Error with get game",error:err.message}); //response error message
  })
});
export default router; //export the router                               