<?php

namespace App\Http\Controllers\Curriculum\Management;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('curriculum/management/Students');
    }
}
