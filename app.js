const express = require('express');
const dotenv = require("dotenv").config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const connectDb = require('./dbconnection');

connectDb();

const app = express();
const PORT = 3500; // ou tout autre port 

// Middleware pour parser les données du formulaire
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Créer un modèle de schéma pour l'utilisateur
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('users', userSchema);

// Route pour la création d'un nouvel utilisateur
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Cet email est déjà utilisé par un autre utilisateur' });
        }

        // Hasher le mot de passe avant de le stocker dans la base de données
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer un nouvel utilisateur
        //const newUser = new User({ username, email, password: hashedPassword });
        const newUser = new User({ username, email, password});
        await newUser.save();

        res.status(201).json({ message: 'Compte créé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Une erreur est survenue lors de la création du compte' });
    }
});

// // Route pour l'authentification de l'utilisateur
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Rechercher l'utilisateur dans la base de données par son email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'L\'email est incorrect' });
        }

        // Vérifier le mot de passe haché
        // const isPasswordValid = await bcrypt.compare(password, user.password);
        const isPasswordValid=1;
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'L\'email ou le mot de passe est incorrect' });
        }

        // Générer un JWT (JSON Web Token)
        const token = jwt.sign({ userId: user._id }, 'ici, code secret', { expiresIn: '1h' });

        res.status(200).json({ message: 'Authentification réussie', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Une erreur est survenue lors de l\'authentification' });
    }
});

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
