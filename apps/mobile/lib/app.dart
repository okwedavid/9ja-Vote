import 'package:flutter/material.dart';

import 'screens/welcome_screen.dart';
import 'theme/app_theme.dart';

class NineJaVoteApp extends StatelessWidget {
  const NineJaVoteApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '9ja Vote',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: const WelcomeScreen(),
    );
  }
}
