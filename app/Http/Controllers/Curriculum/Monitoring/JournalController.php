<?php

namespace App\Http\Controllers\Curriculum\Monitoring;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class JournalController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('curriculum/monitoring/Journals');
    }
}
