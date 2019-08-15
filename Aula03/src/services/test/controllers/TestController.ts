import {Request, Response} from 'express';
import {Test} from '../models/Test';

export class TestController {

  public async index(req: Request, res: Response) {
    try {
      const list = await Test.findAndCountAll();

      return res.json(list);

    } catch (e) {
      return res.status(400).json({message: e.message});
    }
  }

  public async show(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const test = await Test.findByPk(id);
      if (test == null) {
        return res.status(404).json({message: "Teste não encontrado!"});
      }
      return res.status(200).json(test);
    } catch (e) {
      return res.status(400).json({message: e.message});
    }
  }

  public async save(req: Request, res: Response) {
    try {
      const test = await Test.create(req.body);
      return res.status(200).json(test);
    } catch (e) {
      return res.status(400).json({message: e.message});
    }
  }

  public async edit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const test = await Test.findByPk(id);
      if (test == null) {
        return res.status(404).json({message: "Teste não encontrado!"});
      }
      const result = await test.update(req.body);
      return res.status(200).json(result);

    } catch (e) {
      return res.status(400).json({message: e.message});
    }
  }

  public async delete(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const test = await Test.findByPk(id);
        if (test == null) {
          return res.status(404).json({message: "Teste não encontrado!"});
        }
        const result = await Test.destroy({
          where: { id }
        });
        if (result === 1) {
          return res.status(200).json({message: "Registro removido com sucesso!"});
        } else {
          return res.status(404).json({message: "Teste não encontrado!"});
        }
    } catch (e) {
      return res.status(400).json({message: e.message});
    }
  }
}
