import express, { Request, Response, Router } from "express";
import Item from "../models/Item";
import type { IItem } from "../models/Item";

const router: Router = express.Router();

// GET all items
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const items: IItem[] = await Item.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// GET a single item by ID
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const item: IItem | null = await Item.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// POST a new item
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { name, description } = req.body;

  if (!name || !description) {
    res.status(400).json({ message: "Name and description are required" });
    return;
  }

  const newItem: IItem = new Item({ name, description });

  try {
    const savedItem: IItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// PUT (update) an item by ID
router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  const { name, description } = req.body;

  if (!name || !description) {
    res
      .status(400)
      .json({ message: "Name and description are required for update" });
    return;
  }

  try {
    const updatedItem: IItem | null = await Item.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );

    if (!updatedItem) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// DELETE an item by ID
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedItem: IItem | null = await Item.findByIdAndDelete(
      req.params.id
    );
    if (!deletedItem) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;
