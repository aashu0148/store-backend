import express from "express";

import { authenticateUser } from "../../middlewares/authenticate.js";

import { pageSize as sizeOfPage, statusCodes } from "../../utils/constants.js";
import { reqToDbFailed } from "../../utils/utils.js";
import OrderModel from "../../models/Order.js";
import ProductModel from "../../models/Product.js";
import CategoryModel from "../../models/admin/Category.js";
const router = express.Router();


router.get("/topselling", async (req, res) => {
    let result;     
    //to get last 30 days orders
    try {
        result = await OrderModel.find({
            createdAt:{
                $gte:(new Date((new Date()).getTime()-(30*24*60*60*1000))),
            }
        }).populate("items.refProduct");
    } catch (err) {
      reqToDbFailed(res, err);
      return;
    }
    if (!result) {
        res.status(statusCodes.noDataAvailable).json({
          status: false,
          message: "No Orders found",
        });
        return;
      }else  {
          let categoryIds=result[0]?.items?.map(item=>item?.refProduct?.refCategory);
          let categories;
          try {
        categories = await CategoryModel.find(
                {
                       _id:{
                           $in:categoryIds
                       }
                }
               );
        } catch (err) {
          reqToDbFailed(res, err);
          return;
        }
        if (!categories) {
            res.status(statusCodes.noDataAvailable).json({
              status: false,
              message: "No Categories found",
            });
            return;
        }else{
            res.status(statusCodes.ok).json({
                status: true,
                message:"Top Selling Categories",
                categories: categories,
              });

        }
        return;
      }
  
      
  
 
      
  });


export default router;