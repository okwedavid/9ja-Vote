import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Aso Rock photo with an emerald tint so foreground text stays readable.
class AsoRockBackground extends StatelessWidget {
  const AsoRockBackground({super.key, required this.child, this.tint = 0.55});

  final Widget child;
  final double tint;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.emerald,
        image: DecorationImage(
          image: const AssetImage('assets/images/aso-rock.jpg'),
          fit: BoxFit.cover,
          colorFilter: ColorFilter.mode(
            AppColors.emerald900.withValues(alpha: tint),
            BlendMode.srcOver,
          ),
        ),
      ),
      child: child,
    );
  }
}
