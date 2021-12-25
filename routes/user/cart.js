import express from "express";

import { authenticateUser } from "../../middlewares/authenticate.js";
import CartModel from "../../models/Cart.js";
import { pageSize as sizeOfPage, statusCodes } from "../../utils/constants.js";
import { reqToDbFailed } from "../../utils/utils.js";
const router = express.Router();


router.post("/cart/add", async (req, res) => {
    const { productId, userId, quantity } = req.body;



let result,product=[];
try {
  result = await CartModel.findOne({ userId: userId });
} catch (err) {
  reqToDbFailed(res, err);
  return;
}

if (!result) {
  product.push({
    product:productId,
    quantity:quantity
  });
  console.log(product)
  const newCart = new CartModel({
    products: product,
    userId: userId,
    createdAt: new Date(),
    updatedAt:new Date()
  });
   console.log(newCart)
   result=newCart;
}else{
  let Products=result?.products;
  let pro=result?.products?.filter((item,index)=>{
    if(item.product===productId){
      return item;
    }
  }
 
 );
 console.log(pro?.length)
 if(pro?.length>0){
  let index = result?.products?.findIndex(x => x.product ===productId);
  Products[index].quantity=Products[index].quantity+quantity;
  console.log(index,Products)
  result.products=Products;
   result.updatedAt=new Date();
 }else{
   Products.push({
    product:productId,
    quantity:quantity
   })
   result.products=Products;
   result.updatedAt=new Date();
 }
 
 
 
}
console.log(result)
result
.save()
.then((response) => {
  res.status(statusCodes.created).json({
    status: true,
    message: "Item(s) added to cart",
    data: response,
  });
})
.catch((err) => {
  res.status(statusCodes.somethingWentWrong).json({
    status: false,
    message: "Something went wrong",
    error: err,
  });
});
});


router.get("/cart/:userId", async (req, res) => {
  const userId = req.params.userId;

  let result;
  try {
    result = await CartModel.findOne({ userId: userId });
  } catch (err) {
    reqToDbFailed(res, err);
    return;u
  }

  if (!result) {
    res.status(statusCodes.noDataAvailable).json({
      status: false,
      message: "No products found",
    });
    return;
  }

  res.status(statusCodes.ok).json({
    status: true,
    message: "Product found",
    data: result,
  });
});

export default router;