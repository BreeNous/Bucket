//favorited bl items. call to find in bucket lsit where id = to get favorites

//users bucket list. call based on user id

const router = require('express').Router();
const { Project } = require('../../models');
const withAuth = require('../../utils/auth');