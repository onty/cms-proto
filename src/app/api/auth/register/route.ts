import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { UserModel } from '@/models/User';
import { SettingsModel } from '@/models/Settings';

export async function POST(request: NextRequest) {
  try {
    // Check if registration is enabled
    const registrationSetting = await SettingsModel.get('allow_registration');
    const isRegistrationEnabled = registrationSetting?.value === 'true';
    
    if (!isRegistrationEnabled) {
      return NextResponse.json({
        success: false,
        error: 'User registration is currently disabled'
      }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role = 'author', avatar_url, is_active = true } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Name, email, and password are required'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Please enter a valid email address'
      }, { status: 400 });
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Password must be at least 6 characters long'
      }, { status: 400 });
    }

    // Validate role
    const validRoles = ['admin', 'editor', 'author'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid role specified'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await UserModel.getByEmail(email);
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'A user with this email already exists'
      }, { status: 409 });
    }

    // Create user - UserModel.create handles password hashing
    const user = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: role as 'admin' | 'editor' | 'author',
      avatar_url: avatar_url || undefined,
      is_active: is_active
    });

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      data: user
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      error: 'An error occurred during registration'
    }, { status: 500 });
  }
}