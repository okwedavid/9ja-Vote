import 'package:flutter/material.dart';

import '../widgets/aso_rock_background.dart';
import '../widgets/demo_banner.dart';
import 'home_screen.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AsoRockBackground(
        child: SafeArea(
          child: Column(
            children: [
              const DemoBanner(),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      const Icon(Icons.verified_user, color: Colors.white, size: 56),
                      const SizedBox(height: 16),
                      const Text(
                        '9ja Vote',
                        style: TextStyle(color: Colors.white, fontSize: 44, fontWeight: FontWeight.w800),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Your Voice. Your Future. Your Nigeria.',
                        style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Election information and a results demonstration. '
                        'Real voting happens in person at your polling unit, under INEC.',
                        style: TextStyle(color: Color(0xFFD7EBE0), fontSize: 16, height: 1.4),
                      ),
                      const SizedBox(height: 28),
                      FilledButton(
                        onPressed: () => Navigator.of(context).pushReplacement(
                          MaterialPageRoute<void>(builder: (_) => const HomeScreen()),
                        ),
                        child: const Text('Get started'),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
