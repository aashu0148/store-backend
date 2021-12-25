import express from "express";

import { authenticateUser } from "../../middlewares/authenticate.js";
import CartModel from "../../models/Cart.js";
import { pageSize as sizeOfPage, statusCodes } from "../../utils/constants.js";
import { reqToDbFailed } from "../../utils/utils.js";
import ProductModel from "../../models/Product.js";
const router = express.Router();


router.post("/cart/add", authenticateUser,async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.currentUser?._id;
    if (!userId) {
      res.status(statusCodes.unauthorized).json({
        status: false,
        message: "Authorization failed",
      });
      return;
    }

let result,product=[];
try {
  result = await CartModel.findOne({ userId: userId });
} catch (err) {
  reqToDbFailed(res, err);
  return;
}

if (!result) {
  product.push({
    refProduct:productId,
    quantity:quantity
  });
 
  const newCart = new CartModel({
    products: product,
    userId: userId,
    createdAt: new Date(),
    updatedAt:new Date()
  });
  
   result=newCart;
}else{
  let Products=result?.products;
  let pro=result?.products?.filter((item,index)=>{
    if(item.refProduct===productId){
      return item;
    }
  }
 
 );

 if(pro?.length>0){
  let index = result?.products?.findIndex(x => x.refProduct ===productId);
  Products[index].quantity=Products[index].quantity+quantity;

  result.products=Products;
   result.updatedAt=new Date();
 }else{
   Products.push({
    refProduct:productId,
    quantity:quantity
   })
   result.products=Products;
   result.updatedAt=new Date();
 }
 
 
 
}

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


router.get("/cart",authenticateUser, async (req, res) => {
  
  const userId = req.currentUser?._id;
  if (!userId) {
    res.status(statusCodes.unauthorized).json({
      status: false,
      message: "Authorization failed",
    });
    return;
  }

  let result;
  try {
    result = await CartModel.findOne({ userId: userId }).populate("products.refProduct");
  } catch (err) {
    reqToDbFailed(res, err);
    return;
  }

  if (!result) {
    res.status(statusCodes.noDataAvailable).json({
      status: false,
      message: "No products found",
    });
    return;
  }
  let products=[];
  // result?.products?.forEach((element,index) => {
  //   let prod;
  //   console.log(element)
  //   try {
  //     prod   = await ProductModel.findOne({ _id: "61b3755cfd655b693ad199b2" });
  //   } catch (err) {
  //     reqToDbFailed(res, err);
  //     return;
  //   }
  //   console.log(prod)
  //   if(prod?.length>0){
  //     products.push(prod);
  //     products[index].quantity=element.quantity;
  //   }
  // });
  // console.log(products)

  res.status(statusCodes.ok).json({
    status: true,
    message: "Product found",
    data: result,
  });
});

export default router;