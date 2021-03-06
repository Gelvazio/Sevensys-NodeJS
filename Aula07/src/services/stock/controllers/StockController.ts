import { Request, Response } from "express";
import * as mongoose from "mongoose";
import * as _ from "lodash";

import { StockSchema } from "../schemas/stockSchema";
import { ProductApiRequester } from "../../../requesters/productApiRequester";

const Stock = mongoose.model("Stock", StockSchema);

export class StockController {
  public productApiRequester: ProductApiRequester = new ProductApiRequester();

  public async index(req: Request, res: Response) {
    try {
      let list = Stock.find(req.query, (err, rows) => {
        if (err) {
          return res
            .status(400)
            .json({ message: "Ops... Ocorreu um erro!", err: err.message });
        }
        return res.json(rows);
      });
    } catch (e) {
      return res
        .status(400)
        .json({ message: "Ops... Ocorreu um erro!", error: e.message });
    }
  }

  public async stockIn(req: Request, res: Response) {
    try {
      req.body.type = "IN"; //Fixed IN value
      let newStock = new Stock(req.body);

      newStock.save((err, stock) => {
        if (err) {
          res.status(400).json(err);
        }
        res.status(201).json(stock);
      });
    } catch (e) {
      return res
        .status(400)
        .json({ message: "Ops... Ocorreu um erro!", error: e.message });
    }
  }

  public async stockOut(req: Request, res: Response) {
    try {
      req.body.type = "OUT"; //Fixed OUT value
      let newStock = new Stock(req.body);

      newStock.save((err, stock) => {
        if (err) {
          res.status(400).json(err);
        }
        res.status(201).json(stock);
      });
    } catch (e) {
      return res
        .status(400)
        .json({ message: "Ops... Ocorreu um erro!", error: e.message });
    }
  }

  public async deleteAll(req: Request, res: Response) {
    try {
      Stock.remove({}, (err, response) => {
        return res.status(200).json({ err, response });
      });
    } catch (e) {
      return res
        .status(400)
        .json({ message: "Ops... Ocorreu um erro!", error: e.message });
    }
  }

  public async processJob(type: String) {
    try {
      Stock.find({
        status: "PENDING",
        type
      })
        .sort({
          created_date: 1
        })
        .limit(10)
        .exec(async (err, stocks) => {
          if (err) throw new Error(err);

          if (stocks.length > 0) {
            // update para PROCESSED
            const resUpdate = await Stock.updateMany(
              {
                _id: { $in: _.map(stocks, "_id") }
              },
              {
                $set: { status: "PROCESSING" }
              }
            );

            if (resUpdate.nModified < stocks.length)
              throw new Error("Não foi possível realizar todas as requisições");

            for (let stock of stocks) {
              const stockRequest: any = await this.productApiRequester.stock(
                stock.product,
                stock.type,
                stock.quantity
              );

              if (stockRequest.result) {
                stock.status = "PROCESSED";
              } else {
                stock.status = "ERROR";
              }

              stock.result = stockRequest.message;

              await stock.save();
            }

            return resUpdate;
          }
        });
    } catch (error) {}
    console.log("oi");
    return "oi";
  }
}
